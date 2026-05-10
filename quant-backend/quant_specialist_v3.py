import ccxt
import pandas as pd
import numpy as np
import sqlite3
import logging
import time
import os
import json
import urllib.request
import ssl
from datetime import datetime
from typing import Dict, List, Optional, Tuple

# --- CONFIGURATION (憲法に基づき外部設定化を推奨) ---
SYMBOL = os.getenv("QUANT_SYMBOL", "BTC/USDT")
TIMEFRAME = os.getenv("QUANT_TIMEFRAME", "5m") # S&Dは5分足推奨
DATABASE_PATH = os.getenv("QUANT_DB_PATH", "specialist_v3_shadow.db")
FEE_RATE = 0.001 
CONFIDENCE_THRESHOLD = 0.6

# LINE設定 (line-agent-controller/.env から継承)
LINE_ENV_PATH = "/Users/ooshirokazuki2/.gemini/antigravity/scratch/line-agent-controller/.env"
def load_line_env():
    env = {}
    try:
        with open(LINE_ENV_PATH) as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    k, v = line.strip().split('=', 1)
                    env[k] = v.strip('"\'')
    except:
        pass
    return env

LINE_CONFIG = load_line_env()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LineNotifier:
    """President へ戦況を報告し、承認を仰ぐ通信班"""
    def __init__(self):
        self.url = 'https://api.line.me/v2/bot/message/push'
        self.access_token = LINE_CONFIG.get('LINE_CHANNEL_ACCESS_TOKEN', '')
        self.user_id = LINE_CONFIG.get('LINE_ADMIN_USER_ID', '')
        # SSL回避
        self.ctx = ssl.create_default_context()
        self.ctx.check_hostname = False
        self.ctx.verify_mode = ssl.CERT_NONE

    def notify_opportunity(self, side: str, price: float, zone_type: str):
        if not self.access_token or not self.user_id:
            logger.error("LINE Config not found.")
            return

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f"Bearer {self.access_token}"
        }
        
        emoji = "🚀" if side == "LONG" else "📉"
        msg = f"{emoji} 【QUANT SENTINEL：出撃要請】\n{zone_type} ゾーンでの強い反発を検知しました。\n\n通貨: {SYMBOL}\n方向: {side}\n現在価格: ${price:,.1f}\n\nこのチャンスにエントリー（先物）しますか？"
        
        data = {
            'to': self.user_id,
            'messages': [{
                'type': 'text',
                'text': msg,
                'quickReply': {
                    'items': [
                        {'type': 'action', 'action': {'type': 'message', 'label': f'👍 {side}でエントリー', 'text': f'{side}承認'}},
                        {'type': 'action', 'action': {'type': 'message', 'label': '✖️ 見送る', 'text': '見送り'}}
                    ]
                }
            }]
        }
        
        try:
            req = urllib.request.Request(self.url, data=json.dumps(data).encode('utf-8'), headers=headers)
            urllib.request.urlopen(req, context=self.ctx)
            logger.info("LINE Notification sent.")
        except Exception as e:
            logger.error(f"LINE Notification failed: {e}")

class DoyleEngine:
    """SSOT に基づく S&D 知能の Python 実装"""
    
    @staticmethod
    def calc_ema(prices: pd.Series, period: int) -> pd.Series:
        return prices.ewm(span=period, adjust=False).mean()

    @staticmethod
    def find_sd_zones(df: pd.DataFrame, limit: int = 100) -> List[Dict]:
        """Doyle 流 S&D ゾーンの検知アルゴリズム"""
        zones = []
        # ATR 算出
        high_low = df['high'] - df['low']
        high_cp = abs(df['high'] - df['close'].shift(1))
        low_cp = abs(df['low'] - df['close'].shift(1))
        tr = pd.concat([high_low, high_cp, low_cp], axis=1).max(axis=1)
        atr = tr.rolling(14).mean().iloc[-1]
        
        if np.isnan(atr): return []

        for i in range(len(df) - limit, len(df) - 3):
            c1 = df.iloc[i]
            c2 = df.iloc[i+1]
            move = c2['close'] - c1['close']
            
            # Demand Zone: 急騰直前の陰線
            if move > atr * 1.5 and c1['close'] < c1['open']:
                zones.append({
                    'type': 'DEMAND',
                    'top': max(c1['open'], c1['close'], c1['high']),
                    'bottom': min(c1['open'], c1['close'], c1['low']),
                    'timestamp': c1['timestamp']
                })
            # Supply Zone: 急落直前の陽線
            elif move < -atr * 1.5 and c1['close'] > c1['open']:
                zones.append({
                    'type': 'SUPPLY',
                    'top': max(c1['open'], c1['close'], c1['high']),
                    'bottom': min(c1['open'], c1['close'], c1['low']),
                    'timestamp': c1['timestamp']
                })
        return zones

    @staticmethod
    def check_rejection(current: pd.Series, zone: Dict) -> bool:
        """ゾーンでのヒゲ反発検知"""
        if zone['type'] == 'DEMAND':
            return current['low'] <= zone['top'] and current['close'] > zone['top']
        else:
            return current['high'] >= zone['bottom'] and current['close'] < zone['bottom']

class MarketDataFetcher:
    def __init__(self, exchange_id='binance'):
        self.exchange = getattr(ccxt, exchange_id)({
            'enableRateLimit': True,
            'options': {'defaultType': 'future'}
        })

    def get_ohlcv(self, symbol: str, timeframe: str, limit: int = 200) -> Optional[pd.DataFrame]:
        try:
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe=timeframe, limit=limit)
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            return df
        except Exception as e:
            logger.error(f"Fetcher Error: {e}")
            return None

class QuantSpecialistV3:
    def __init__(self):
        self.fetcher = MarketDataFetcher()
        self.engine = DoyleEngine()
        self.notifier = LineNotifier()

    def check_kill_switch(self, df: pd.DataFrame) -> bool:
        """異常相場検知（キルスイッチ）"""
        # 1. ボラティリティ異常 (ATRが急拡大)
        high_low = df['high'] - df['low']
        atr = high_low.rolling(14).mean()
        avg_atr = atr.rolling(100).mean().iloc[-1]
        current_atr = atr.iloc[-1]
        
        # 2. フラッシュクラッシュ検知 (1本で5%以上の変動)
        last_change = abs(df['close'].iloc[-1] - df['open'].iloc[-1]) / df['open'].iloc[-1]
        
        if current_atr > avg_atr * 5 or last_change > 0.05:
            logger.critical("🚨 KILL SWITCH ACTIVATED: Extreme Volatility Detected!")
            return True
        return False

    def execute_loop(self):
        logger.info(f"🛡️ QUANT SENTINEL v1.1 [DOYLE/LINE] Engaged. Monitoring {SYMBOL}...")
        while True:
            try:
                df = self.fetcher.get_ohlcv(SYMBOL, TIMEFRAME)
                if df is not None:
                    current_price = df['close'].iloc[-1]
                    ema200 = self.engine.calc_ema(df['close'], 200).iloc[-1]
                    
                    # 0. 安全装置チェック (Kill Switch)
                    if self.check_kill_switch(df):
                        logger.warning("System Silent Mode: Waiting for market to stabilize.")
                        time.sleep(300)
                        continue

                    # 1. ゾーン検知 (Doyle 理論)
                    zones = self.engine.find_sd_zones(df)
                    
                    # 2. 反発チェック
                    for zone in zones:
                        if self.engine.check_rejection(df.iloc[-1], zone):
                            # トレンド一致確認 (Doyle EMA200 フィルター)
                            side = "LONG" if zone['type'] == "DEMAND" else "SHORT"
                            is_trend_match = (side == "LONG" and current_price > ema200) or \
                                             (side == "SHORT" and current_price < ema200)
                            
                            if is_trend_match:
                                logger.warning(f"S&D Opportunity Detected: {side}")
                                self.notifier.notify_opportunity(side, current_price, zone['type'])
                                break # 1回通知したら待機

                logger.info(f"Market Scan OK. Price: {df['close'].iloc[-1]:.1f} | EMA200: {ema200:.1f}")
                
            except Exception as e:
                logger.error(f"Loop Error: {e}")
            
            time.sleep(60) # 1分ハイブリッド監視

if __name__ == "__main__":
    specialist = QuantSpecialistV3()
    specialist.execute_loop()

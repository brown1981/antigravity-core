import urllib.request
import json
import random

def get_whale_activity():
    """
    主要通貨の出来高急増を検知し、大口取引の可能性（鯨の活動）を報告します。
    (Whale Sonar の移植・実戦版)
    """
    coins = ['bitcoin', 'ethereum', 'solana']
    results = {
        'whales': [],
        'divergence_score': 0,
        'status': 'SCANNING'
    }
    
    total_pressure = 0
    
    try:
        # CoinGecko から24時間の出来高データを取得
        url = f'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids={",".join(coins)}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            for coin_data in data:
                # 簡易ロジック: 出来高と時価総額の比率(V/MC)から圧力を計算
                vol_mc_ratio = coin_data['total_volume'] / coin_data['market_cap']
                
                # シミュレーション的な鯨の生成 (V/MCが高いほど、大口が動いていると仮定)
                if vol_mc_ratio > 0.05: # 5%以上の回転率は活発
                    pressure = (vol_mc_ratio * 100) * (1 if coin_data['price_change_percentage_24h'] > 0 else -1)
                    total_pressure += pressure
                    
                    results['whales'].append({
                        'coin': coin_data['symbol'].upper(),
                        'amount': round(coin_data['total_volume'] / 1000000, 2), # 百万ドル単位
                        'type': 'Inflow' if coin_data['price_change_percentage_24h'] > 0 else 'Outflow',
                        'intensity': round(vol_mc_ratio * 100, 2)
                    })
        
        results['divergence_score'] = round(total_pressure, 2)
        if abs(results['divergence_score']) > 15:
            results['status'] = 'ALERT'
        
    except Exception as e:
        results['error'] = str(e)

    return json.dumps(results, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print(get_whale_activity())

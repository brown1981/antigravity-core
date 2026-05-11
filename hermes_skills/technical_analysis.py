import urllib.request
import json
import math

def get_technical_analysis():
    """
    主要通貨（BTC, ETH, SOL）のテクニカル指標を計算し、売買シグナルを判定します。
    (Logic Shield の移植版)
    """
    coins = ['bitcoin', 'ethereum', 'solana']
    results = {}
    
    for coin in coins:
        try:
            # 60日分のヒストリカルデータを取得
            url = f'https://api.coingecko.com/api/v3/coins/{coin}/market_chart?vs_currency=usd&days=60&interval=daily'
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode('utf-8'))
                prices = [p[1] for p in data['prices']]
                volumes = [v[1] for v in data['total_volumes']]
                
                score = 0
                indicators = {}
                
                # 1. RSI (14 days)
                rsi = calc_rsi(prices)
                indicators['rsi'] = round(rsi, 2)
                if rsi < 30: score += 1
                elif rsi > 70: score -= 1
                
                # 2. MACD (Simplified)
                ema12 = calc_ema(prices, 12)
                ema26 = calc_ema(prices, 26)
                macd_line = [e12 - e26 for e12, e26 in zip(ema12, ema26)]
                signal_line = calc_ema(macd_line, 9)
                hist = macd_line[-1] - signal_line[-1]
                indicators['macd_hist'] = "BULL" if hist > 0 else "BEAR"
                score += 1 if hist > 0 else -1
                
                # 3. SMA (20 vs 50)
                sma20 = sum(prices[-20:]) / 20
                sma50 = sum(prices[-50:]) / 50
                indicators['sma_trend'] = "UP" if sma20 > sma50 else "DOWN"
                score += 1 if sma20 > sma50 else -1
                
                # 4. Bollinger Bands
                bb_pos = calc_bollinger(prices)
                indicators['bb_pos'] = round(bb_pos, 2)
                if bb_pos < 0.2: score += 1
                elif bb_pos > 0.8: score -= 1
                
                # 5. OBV
                obv = calc_obv(prices, volumes)
                indicators['obv'] = "INFLOW" if obv > 0 else "OUTFLOW"
                score += 1 if obv > 0 else -1
                
                results[coin] = {
                    'price': round(prices[-1], 2),
                    'score': score,
                    'indicators': indicators,
                    'signal': get_signal_label(score)
                }
                
        except Exception as e:
            results[coin] = {'error': str(e)}

    return json.dumps(results, ensure_ascii=False, indent=2)

def calc_rsi(prices, periods=14):
    if len(prices) <= periods: return 50
    gains = 0
    losses = 0
    for i in range(len(prices) - periods, len(prices)):
        diff = prices[i] - prices[i-1]
        if diff >= 0: gains += diff
        else: losses -= diff
    if losses == 0: return 100
    rs = (gains / periods) / (losses / periods)
    return 100 - (100 / (1 + rs))

def calc_ema(prices, days):
    k = 2 / (days + 1)
    ema = [prices[0]]
    for i in range(1, len(prices)):
        ema.append(prices[i] * k + ema[i-1] * (1 - k))
    return ema

def calc_bollinger(prices):
    slice_prices = prices[-20:]
    if len(slice_prices) < 20: return 0.5
    sma = sum(slice_prices) / 20
    variance = sum([(p - sma) ** 2 for p in slice_prices]) / 20
    std_dev = math.sqrt(variance)
    lower = sma - (std_dev * 2)
    upper = sma + (std_dev * 2)
    if upper == lower: return 0.5
    return (prices[-1] - lower) / (upper - lower)

def calc_obv(prices, volumes, periods=7):
    obv = 0
    start = max(1, len(prices) - periods)
    for i in range(start, len(prices)):
        if prices[i] > prices[i-1]: obv += volumes[i]
        elif prices[i] < prices[i-1]: obv -= volumes[i]
    return obv

def get_signal_label(score):
    if score >= 3: return "STRONG BUY"
    if score >= 1: return "BUY"
    if score <= -3: return "STRONG SELL"
    if score <= -1: return "SELL"
    return "NEUTRAL"

if __name__ == "__main__":
    print(get_technical_analysis())

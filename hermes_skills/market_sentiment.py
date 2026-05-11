import urllib.request
import json
from datetime import datetime

def get_market_sentiment():
    """
    Fear & Greed Index と主要仮想通貨（BTC, ETH, SOL）の価格データを取得し、
    市場のセンチメントを分析します。
    """
    results = {
        'fear_and_greed': {'now': '50', 'classification': 'Neutral', 'history': []},
        'prices': {},
        'analysis': 'データ取得中にエラーが発生しました。'
    }
    
    # 1. Fear & Greed Index の取得
    try:
        req = urllib.request.Request('https://api.alternative.me/fng/?limit=7', headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            fng_data = json.loads(response.read().decode('utf-8'))
            if 'data' in fng_data and len(fng_data['data']) > 0:
                results['fear_and_greed'] = {
                    'now': fng_data['data'][0]['value'],
                    'classification': fng_data['data'][0]['value_classification'],
                    'history': [d['value'] for d in fng_data['data']]
                }
    except Exception as e:
        print(f"DEBUG: FnG Fetch Error: {e}")
        results['fear_and_greed_error'] = str(e)

    # 2. CoinGecko 価格データの取得
    coins = ['bitcoin', 'ethereum', 'solana']
    try:
        url = f'https://api.coingecko.com/api/v3/simple/price?ids={",".join(coins)}&vs_currencies=usd&include_24hr_change=true'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            results['prices'] = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"DEBUG: Price Fetch Error: {e}")
        results['prices_error'] = str(e)

    # 3. 簡易分析
    try:
        fng_value = int(results['fear_and_greed']['now'])
        if fng_value >= 75:
            results['analysis'] = "極度の強気（Extreme Greed）。警戒が必要です。"
        elif fng_value <= 25:
            results['analysis'] = "極度の恐怖（Extreme Fear）。絶好の買い場の可能性があります。"
        else:
            results['analysis'] = results['fear_and_greed']['classification'] + "。市場は安定しています。"
    except:
        results['analysis'] = "センチメント分析を実行できませんでした。"

    return json.dumps(results, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print(get_market_sentiment())

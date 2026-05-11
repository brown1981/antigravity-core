import urllib.request
import json

def get_global_radar():
    """
    仮想通貨市場全体の統計データ（ドミナンス、時価総額、トレンド）を取得します。
    (Global Radar の移植版)
    """
    results = {
        'btc_dominance': 0,
        'total_market_cap': 0,
        'total_volume': 0,
        'trending_coins': []
    }
    
    try:
        # 1. グローバル統計の取得
        url_global = 'https://api.coingecko.com/api/v3/global'
        req_global = urllib.request.Request(url_global, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_global, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))['data']
            results['btc_dominance'] = round(data['market_cap_percentage']['btc'], 2)
            results['total_market_cap'] = round(data['total_market_cap']['usd'] / 1e12, 2) # T USD
            results['total_volume'] = round(data['total_volume']['usd'] / 1e9, 2) # B USD

        # 2. トレンド通貨の取得
        url_trend = 'https://api.coingecko.com/api/v3/search/trending'
        req_trend = urllib.request.Request(url_trend, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_trend, timeout=10) as response:
            trend_data = json.loads(response.read().decode('utf-8'))
            results['trending_coins'] = [coin['item']['symbol'] for coin in trend_data['coins'][:5]]

    except Exception as e:
        results['error'] = str(e)

    return json.dumps(results, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print(get_global_radar())

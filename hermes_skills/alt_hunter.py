import urllib.request
import json

def get_alt_hunting_report():
    """
    時価総額20位〜500位の通貨から、急騰中(Eruption)や好セットアップの銘柄を抽出します。
    (Alt Hunter の移植版)
    """
    results = {
        'eruptions': [],
        'golden_setups': [],
        'market_sentiment': 'NEUTRAL'
    }
    
    try:
        # 時価総額上位500銘柄を取得 (ページ1〜2)
        all_coins = []
        for page in [1, 2]:
            url = f'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page={page}&sparkline=false&price_change_percentage=1h,24h'
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                all_coins.extend(json.loads(response.read().decode('utf-8')))

        total_1h_change = 0
        
        for coin in all_coins:
            rank = coin.get('market_cap_rank', 999)
            if rank is None: rank = 999
            
            c1h = coin.get('price_change_percentage_1h_in_currency', 0) or 0
            c24h = coin.get('price_change_percentage_24h_in_currency', 0) or 0
            total_1h_change += c1h
            
            # 1. Eruption (急騰銘柄) の検知
            # 条件: ランク20位以下かつ24h騰落率が20%以上
            if rank > 20 and c24h >= 20:
                results['eruptions'].append({
                    'symbol': coin['symbol'].upper(),
                    'rank': rank,
                    'change24h': round(c24h, 2),
                    'change1h': round(c1h, 2)
                })

            # 2. Golden Setup (反発の兆し)
            # 条件: 24hはマイナスだが1hで強く買われている
            if rank > 10 and c24h < -5 and c1h > 3:
                results['golden_setups'].append({
                    'symbol': coin['symbol'].upper(),
                    'rank': rank,
                    'change24h': round(c24h, 2),
                    'change1h': round(c1h, 2)
                })

        # 市場全体の雰囲気
        avg_1h = total_1h_change / len(all_coins) if all_coins else 0
        if avg_1h > 0.5: results['market_sentiment'] = 'BULLISH'
        elif avg_1h < -0.5: results['market_sentiment'] = 'BEARISH'
        
        # ソートして上位に絞る
        results['eruptions'].sort(key=lambda x: x['change24h'], reverse=True)
        results['eruptions'] = results['eruptions'][:5]
        results['golden_setups'] = results['golden_setups'][:5]

    except Exception as e:
        results['error'] = str(e)

    return json.dumps(results, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print(get_alt_hunting_report())

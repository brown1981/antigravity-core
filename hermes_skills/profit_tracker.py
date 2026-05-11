import urllib.request
import json
import os

PORTFOLIO_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'portfolio_data.json')

def get_profit_status():
    """
    ポートフォリオの現在価値と利益を計算し、目標達成率を報告します。
    (Joy Profit の移植版)
    """
    # 1. ポートフォリオデータの読み込み
    if os.path.exists(PORTFOLIO_FILE):
        with open(PORTFOLIO_FILE, 'r') as f:
            app_data = json.load(f)
    else:
        # デフォルトデータ
        app_data = {
            'goalName': 'Antigravity Fortress',
            'goalPrice': 50000,
            'assets': [
                {'coin': 'bitcoin', 'buyPrice': 45000, 'amount': 0.1},
                {'coin': 'ethereum', 'buyPrice': 2500, 'amount': 1.0}
            ]
        }
        with open(PORTFOLIO_FILE, 'w') as f:
            json.dump(app_data, f)

    # 2. 最新価格の取得
    unique_coins = list(set([a['coin'] for a in app_data['assets']]))
    prices = {}
    try:
        url = f'https://api.coingecko.com/api/v3/simple/price?ids={",".join(unique_coins)}&vs_currencies=usd'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            prices = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return json.dumps({'error': f'Price fetch error: {e}'})

    # 3. 収益計算
    total_cost = 0
    total_value = 0
    asset_details = []
    
    for asset in app_data['assets']:
        current_price = prices.get(asset['coin'], {}).get('usd', 0)
        cost = asset['buyPrice'] * asset['amount']
        value = current_price * asset['amount']
        profit = value - cost
        
        total_cost += cost
        total_value += value
        
        asset_details.append({
            'coin': asset['coin'].upper(),
            'current_price': current_price,
            'value': round(value, 2),
            'profit': round(profit, 2),
            'profit_pct': round((profit / cost * 100), 2) if cost > 0 else 0
        })

    total_profit = total_value - total_cost
    goal_progress = (total_value / app_data['goalPrice'] * 100) if app_data['goalPrice'] > 0 else 0
    
    results = {
        'goal_name': app_data['goalName'],
        'goal_price': app_data['goalPrice'],
        'total_value': round(total_value, 2),
        'total_profit': round(total_profit, 2),
        'goal_progress': round(goal_progress, 2),
        'assets': asset_details
    }

    return json.dumps(results, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print(get_profit_status())

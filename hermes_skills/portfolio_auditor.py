import json
import os

PORTFOLIO_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'portfolio_data.json')

def audit_portfolio():
    """
    ポートフォリオの防御力（ストレス耐性）を診断します。
    (Portfolio Fortress の移植版)
    """
    if not os.path.exists(PORTFOLIO_FILE):
        return json.dumps({'error': 'No portfolio data found'})

    with open(PORTFOLIO_FILE, 'r') as f:
        data = json.load(f)

    # 簡易ストレステスト: BTC -30% の影響
    # 本来は全資産の相関を見るが、ここでは主要資産の下落をシミュレート
    total_value = 0
    stress_value = 0
    
    # 資産構成の分析
    allocation = {}
    for asset in data['assets']:
        # 仮の現在価格（本来はリアルタイムデータを渡すべきだが、ここでは比率を見る）
        val = asset['buyPrice'] * asset['amount'] # 暫定
        total_value += val
        allocation[asset['coin']] = allocation.get(asset['coin'], 0) + val
        
        # ストレスシナリオ: 全資産一律 -30%
        stress_value += val * 0.7

    shield_integrity = 100 - (len(allocation) * 5) # 分散が少ないほど低く設定（簡易）
    if len(allocation) >= 5: shield_integrity = 95
    
    results = {
        'shield_integrity': shield_integrity,
        'survival_rate': round((stress_value / total_value * 100), 1) if total_value > 0 else 0,
        'diversification': "OPTIMAL" if len(allocation) >= 3 else "CONCENTRATED",
        'recommendation': "分散投資が適切に機能しています。" if len(allocation) >= 3 else "特定の銘柄への集中が目立ちます。分散を検討してください。"
    }

    return json.dumps(results, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print(audit_portfolio())

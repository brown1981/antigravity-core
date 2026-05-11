import json

def generate_tactical_briefing(sentiment_data, tech_data, whale_data, global_data):
    """
    収集された全データに基づき、戦術的なブリーフィング（シナリオとアクションプラン）を生成します。
    (Tactical Briefing の移植・進化版)
    """
    
    fng = int(sentiment_data.get('fear_and_greed', {}).get('now', 50))
    btc_sig = tech_data.get('bitcoin', {}).get('signal', 'NEUTRAL')
    div_score = whale_data.get('divergence_score', 0)
    dom = global_data.get('btc_dominance', 0)
    
    # シナリオ生成ロジック
    scenarios = []
    
    # Case A: Bullish
    if fng < 40 or btc_sig == "STRONG BUY":
        scenarios.append({
            'case': 'BULLISH (REBOUND)',
            'title': "逆張り好機",
            'desc': "市場の恐怖を背に、クジラの蓄積とテクニカルの反発が一致しています。強気な買い下がりを推奨。"
        })
    else:
        scenarios.append({
            'case': 'BULLISH (MOMENTUM)',
            'title': "上昇継続",
            'desc': "ドミナンスの推移と出来高の増加から、さらなる上値追いが期待できます。"
        })
        
    # Case B: Bearish
    if fng > 75 or btc_sig == "STRONG SELL":
        scenarios.append({
            'case': 'BEARISH (OVERHEAT)',
            'title': "天井警戒",
            'desc': "極度の強気とテクニカルの乖離。大口の利益確定が始まっており、急落の可能性が高いです。"
        })
    else:
        scenarios.append({
            'case': 'BEARISH (CORRECTION)',
            'title': "調整リスク",
            'desc': "短期的な過熱感による健全な調整期間。安易なロングは控え、下値を待つべきです。"
        })

    # アクションプラン
    actions = []
    if fng > 70:
        actions.append({"label": "DEFENSE", "desc": "キャッシュ比率を50%以上に高め、嵐が過ぎるのを待て。"})
    elif fng < 30:
        actions.append({"label": "OFFENSE", "desc": "主要通貨（BTC/ETH）を中心に、資金を段階的に投入せよ。"})
    else:
        actions.append({"label": "NEUTRAL", "desc": "既存ポジションを維持し、トレンドの決着を待て。"})
        
    results = {
        'scenarios': scenarios,
        'actions': actions
    }

    return json.dumps(results, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    # Test with dummy data
    print(generate_tactical_briefing({}, {}, {}, {}))

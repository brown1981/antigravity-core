import json


def get_dca_advice(fng_value, tech_signal):
    """
    現在の市場状況に基づき、DCA（積立）戦略のアドバイスを提供します。
    (DCA Fortress の移植・進化版)
    """
    
    fng = int(fng_value)
    
    advice = {
        'multiplier': 1.0,
        'strategy': 'STANDARD_DCA',
        'message': '通常の積立を継続してください。'
    }
    
    if fng < 20:
        advice['multiplier'] = 2.0
        advice['strategy'] = 'AGGRESSIVE_ACCUMULATION'
        advice['message'] = '市場は極度の恐怖にあります。積立額を倍増（2.0x）し、安値を積極的に拾う好機です。'
    elif fng < 35:
        advice['multiplier'] = 1.5
        advice['strategy'] = 'BOOSTED_DCA'
        advice['message'] = '割安圏内です。積立額を 1.5倍 に増量することを検討してください。'
    elif fng > 75:
        advice['multiplier'] = 0.5
        advice['strategy'] = 'CAUTIOUS_HOLD'
        advice['message'] = '市場が過熱しています。新規積立を半分（0.5x）に抑え、キャッシュを温存してください。'
    elif tech_signal == "STRONG SELL":
        advice['multiplier'] = 0.8
        advice['strategy'] = 'TECHNICAL_DEFENSE'
        advice['message'] = 'テクニカル的な下落リスクがあります。積立をやや控えめにし、様子を見てください。'

    return json.dumps(advice, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print(get_dca_advice(25, "BUY"))

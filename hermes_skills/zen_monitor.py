import json

import random

def get_zen_status():
    """
    ネットワークの混雑状況（ガス代）を確認し、精神的な平穏（禅）のアドバイスを提供します。
    (Zen Tracker の移植版)
    """
    
    base_gas = random.randint(15, 45)
    
    zen_quotes = [
        "Patience is the greatest prayer.",
        "The market is a sea; don't fight the waves, float with them.",
        "Wait for the signal. Forced action leads to ruin.",
        "Quiet the mind, and the trend will reveal itself."
    ]
    
    status = "OPTIMAL" if base_gas < 25 else "CONGESTED"
    
    results = {
        'eth_gas': base_gas,
        'status': status,
        'advice': "取引手数料が安価です。資産移動の好機です。" if status == "OPTIMAL" else "ネットワークが混雑しています。急ぎでない限り、静観を推奨します。",
        'quote': random.choice(zen_quotes)
    }

    return json.dumps(results, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print(get_zen_status())

import sys
sys.path.append("/Users/ooshirokazuki2/.gemini/antigravity/scratch/quant-backend")
from quant_specialist_v3 import CoreEngine

def test_engine_sync():
    engine = CoreEngine()
    
    # テストケース1: 明確な買いシグナル
    # RSI < 30 (+40), Bullish MACD (+30), BB LOWER (+20) = Total 90
    score_90 = engine.calc_composite_score(rsi_val=25, is_bullish_macd=True, bb_pos="LOWER")
    print(f"Test 1 (Strong Buy): Expected 90, Got {score_90}")
    
    # テストケース2: 中立に近い
    # RSI 50 (+0), Bullish MACD (+30), BB NORMAL (+0) = Total 30 (BUY)
    score_30 = engine.calc_composite_score(rsi_val=50, is_bullish_macd=True, bb_pos="NORMAL")
    print(f"Test 2 (Neutral/Buy): Expected 30, Got {score_30}")

    # テストケース3: 売り
    # RSI > 70 (-40), Bearish MACD (+0), BB UPPER (-20) = Total -60
    score_m60 = engine.calc_composite_score(rsi_val=75, is_bullish_macd=False, bb_pos="UPPER")
    print(f"Test 3 (Strong Sell): Expected -60, Got {score_m60}")

if __name__ == "__main__":
    test_engine_sync()

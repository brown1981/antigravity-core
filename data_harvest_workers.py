import time
import json
import os
import sys
import traceback

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import data_lake_manager as lake

# 個別スキルのインポート (考える部分は除外)
from hermes_skills.market_sentiment import get_market_sentiment
from hermes_skills.technical_analysis import get_technical_analysis
from hermes_skills.whale_sonar import get_whale_activity
from hermes_skills.profit_tracker import get_profit_status
from hermes_skills.global_radar import get_global_radar
from hermes_skills.alt_hunter import get_alt_hunting_report
from hermes_skills.system_health import get_system_health
from hermes_skills.team_spirit import get_team_sync
from hermes_skills.knowledge_manager import get_knowledge_summary
from hermes_skills.zen_monitor import get_zen_status
from hermes_skills.quant_sentinel import get_quant_signals

# 各アプリとデータ収集関数のマッピング
WORKERS = {
    "01_mood_orbit": get_market_sentiment,
    "02_logic_shield": get_technical_analysis,
    "03_joy_profit": get_profit_status,
    "04_whale_sonar": get_whale_activity,
    "06_global_radar": get_global_radar,
    "07_alt_hunter": get_alt_hunting_report,
    "09_cyber_nexus": get_system_health,
    "10_team_spirit": get_team_sync,
    "12_intelligence_hub": get_knowledge_summary,
    "13_zen_tracker": get_zen_status,
    "14_quant_sentinel": get_quant_signals,
}

def run_harvest_cycle():
    print("🚜 [DATA HARVESTERS] Starting independent data collection cycle...")
    
    for app_id, harvest_func in WORKERS.items():
        try:
            # データの取得
            raw_data = harvest_func()
            
            # JSON文字列の場合は辞書に戻す
            if isinstance(raw_data, str):
                data_dict = json.loads(raw_data)
            else:
                data_dict = raw_data
                
            # データレイクへ非同期に保存
            lake.write_to_lake(app_id, data_dict)
            print(f"  └ 💾 Saved: {app_id}")
            
        except Exception as e:
            # 完全に独立しているため、1つのアプリが死んでも他に影響しない
            print(f"  └ ❌ Error in {app_id}: {e}")
            # lake.write_to_lake(app_id, {"error": str(e), "trace": traceback.format_exc()})
            continue

def start_background_loop(interval=120):
    """
    Webサーバー（app.py）のバックグラウンドスレッドから呼び出される無限ループ
    """
    while True:
        run_harvest_cycle()
        time.sleep(interval)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--one-shot', action='store_true')
    args = parser.parse_args()

    if args.one_shot:
        run_harvest_cycle()
    else:
        start_background_loop()


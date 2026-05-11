import time
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import data_lake_manager as lake
import antigravity_db as db

# 思考・戦略立案を行うサブAIモジュール（彼らはデータ収集を行わず、データを分析する）
from hermes_skills.tactical_briefing import generate_tactical_briefing
from hermes_skills.dca_advisor import get_dca_advice
from hermes_skills.portfolio_auditor import audit_portfolio
from hermes_skills.daily_compass import get_daily_compass

def run_ai_board_meeting():
    print("🏛️ [AI COMPANY] Hermes CEO has called a Board Meeting.")
    
    try:
        # 1. データレイクから全非同期データを読み込む (欠損があっても止まらない)
        print("📊 [AI COMPANY] Reading asynchronous data from the Data Lake...")
        lake_data = lake.get_all_lake_data()
        
        # 必要なデータを安全に抽出 (データが欠損している場合はデフォルトの空辞書を使用)
        sentiment = lake_data.get("01_mood_orbit", {}).get("data", {})
        tech_data = lake_data.get("02_logic_shield", {}).get("data", {})
        whale_data = lake_data.get("04_whale_sonar", {}).get("data", {})
        global_data = lake_data.get("06_global_radar", {}).get("data", {})
        health_data = lake_data.get("09_cyber_nexus", {}).get("data", {})
        team_data = lake_data.get("10_team_spirit", {}).get("data", {})
        knowledge_data = lake_data.get("12_intelligence_hub", {}).get("data", {})
        zen_data = lake_data.get("13_zen_tracker", {}).get("data", {})
        quant_data = lake_data.get("14_quant_sentinel", {}).get("data", {})
        
        fng_value = sentiment.get('fear_and_greed', {}).get('now', 50)
        fng_class = sentiment.get('fear_and_greed', {}).get('classification', 'Neutral')
        
        # 2. サブAIたちによる高度な分析・戦略立案 (Cognitive Actions)
        import json
        compass_data = json.loads(get_daily_compass())
        audit_data = json.loads(audit_portfolio())
        
        # 戦略立案サブAIの稼働 (一部のデータが空でもエラーにならずフェールセーフで動くように設計)
        briefing_json = generate_tactical_briefing(sentiment, tech_data, whale_data, global_data)
        briefing = json.loads(briefing_json)
        
        btc_sig = tech_data.get('bitcoin', {}).get('signal', 'NEUTRAL')
        dca_json = get_dca_advice(fng_value, btc_sig)
        dca_advice = json.loads(dca_json)
        
        # 3. CEO (Hermes) による最終レポートのコンパイル
        title = f"経営戦略会議: {fng_class}({fng_value}) | {compass_data['date']}"
        
        # レポート本文
        description = f"【システム状況】\nデータレイクからの取得状況: {len(lake_data)}/11 アプリ稼働中\n"
        description += f"ノード: {health_data.get('overall_status', 'UNKNOWN')} | 知識: {knowledge_data.get('total_reports', 0)}件 | GAS: {zen_data.get('eth_gas', '?')} Gwei\n\n"
        
        description += f"【要塞防御力 (Portfolio Fortress)】\nシールド整合性: {audit_data.get('shield_integrity', '?')}% | 生存率: {audit_data.get('survival_rate', '?')}%\n\n"
        
        description += "【戦術ブリーフィング】\n"
        for sc in briefing.get('scenarios', []):
            description += f"● {sc.get('case')}: {sc.get('title')}\n   {sc.get('desc')}\n"
        
        description += "\n【定量的セットアップ】\n"
        for p in quant_data.get('patterns', [])[:2]:
            description += f"⚡ {p.get('asset')}: {p.get('setup')} (確度:{p.get('prob')})\n"
        
        description += f"\n【積立戦略 (DCA)】\n推奨倍率: {dca_advice.get('multiplier')}x | 助言: {dca_advice.get('message')}\n"
        
        description += "\n【具体的アクション】\n"
        for act in briefing.get('actions', []):
            description += f"▼ {act.get('label')}: {act.get('desc')}\n"
            
        description += f"\n---\n📜 精神規律: \"{compass_data.get('discipline')}\""

        # 4. Boardroom (司令室) への投稿
        print("📡 [AI COMPANY] Submitting decisions to Boardroom...")
        db.create_task(title=title, description=description, assignee="shinbou")
        
        tasks = db.get_all_tasks()
        if tasks:
            db.update_task_status(tasks[0]['id'], "DONE", reason="AI経営会議 完了 (非同期データ参照)")
        
        print("✅ Board Meeting Adjourned.")
        
    except Exception as e:
        print(f"❌ AI Board Meeting Error: {e}")

def execute_direct_mission(instruction):
    """
    Web画面から送られた人間からの直接指示（Mission）を即座に処理する関数
    """
    print(f"🎯 [DIRECT COMMAND] Received from Web UI: {instruction}")
    
    # 実際にはここでLLM（Gemini等）を呼び出して指示に対する回答を生成しますが、
    # まずは受け取った指示をシステムが認識してタスクとして発行するロジックを組みます。
    
    title = f"緊急ミッション受領: {instruction[:15]}..."
    description = f"【Direct Command】\nユーザーから以下の直接指示を受け取りました。\n\n『{instruction}』\n\n"
    description += "ステータス: 処理中（次回の経営会議にてデータ分析結果と合わせて報告予定）"
    
    print("📡 [AI COMPANY] Submitting Direct Mission to Boardroom...")
    db.create_task(title=title, description=description, assignee="Hermes CEO")
    return {"status": "success", "message": "Mission acknowledged and queued."}

def start_background_loop(interval=300):
    """
    Webサーバー（app.py）のバックグラウンドスレッドから呼び出される無限ループ
    """
    while True:
        run_ai_board_meeting()
        time.sleep(interval)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--one-shot', action='store_true')
    parser.add_argument('--mission', type=str, help="直接指示テキスト")
    args = parser.parse_args()

    if args.mission:
        execute_direct_mission(args.mission)
    elif args.one_shot:
        run_ai_board_meeting()
    else:
        start_background_loop()


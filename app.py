import os
import sys
import json
import threading
from flask import Flask, request, jsonify, send_from_directory

# 独自のパス設定
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 自作モジュール群のインポート
import data_harvest_workers
import autonomous_patrol
import export_to_drive
import antigravity_db as db

app = Flask(__name__, static_url_path='', static_folder='static')

# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------

@app.route('/')
def index():
    """フロントエンドのWeb UIを表示します"""
    return send_from_directory('static', 'index.html')

@app.route('/api/status', methods=['GET'])
def get_status():
    """
    Boardroom UIが最新のAIタスク（戦略報告など）を取得するためのAPI
    """
    try:
        tasks = db.get_all_tasks()
        return jsonify({"status": "success", "tasks": tasks})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/command', methods=['POST'])
def send_command():
    """
    Web UIから人間がHermesに直接指示（Mission）を送るためのAPI
    """
    data = request.json
    instruction = data.get('instruction')
    
    if not instruction:
        return jsonify({"status": "error", "message": "Instruction is empty"}), 400
        
    try:
        # CEOロジックに直接指示を渡して処理させる
        # フロントエンドからは 'instruction' と 'title' が送られてくる
        title = data.get('title', 'Direct Mission')
        result = autonomous_patrol.execute_direct_mission(instruction, title=title)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# -------------------------------------------------------------
# Background Sub-AI Threads Manager
# -------------------------------------------------------------

def start_ai_company():
    """すべてのAI部署をバックグラウンドスレッドで起動します"""
    print("🚀 [HQ] Initializing Knowledge Base...")
    db.init_db() # 起動時にテーブル作成を保証
    print("🚀 [HQ] Starting Antigravity Engine (AI Company)...")
    
    # 1. データ収集部 (2分間隔)
    t_harvester = threading.Thread(target=data_harvest_workers.start_background_loop, args=(120,), daemon=True)
    t_harvester.start()
    
    # 2. 経営会議部・CEO (5分間隔)
    t_ceo = threading.Thread(target=autonomous_patrol.start_background_loop, args=(300,), daemon=True)
    t_ceo.start()
    
    # 3. エクスポート部 (1時間間隔)
    t_export = threading.Thread(target=export_to_drive.start_background_loop, args=(3600,), daemon=True)
    t_export.start()
    
    print("✅ [HQ] All Sub-AIs are now running in the background.")

# -------------------------------------------------------------
# Server Entry Point
# -------------------------------------------------------------

if __name__ == '__main__':
    # Flaskアプリ起動時にスレッドマネージャーを実行
    start_ai_company()
    
    # Webサーバーの起動 (ポート8080)
    print("🌐 [HQ] Web Interface available at: http://localhost:8080")
    app.run(host='0.0.0.0', port=8080, debug=False, use_reloader=False)

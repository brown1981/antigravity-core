import time
import json
import urllib.request
import urllib.error
import threading
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
import antigravity_db as db

OLLAMA_URL = "http://localhost:11434/api/chat"

# 役職ごとのAI設定（システムプロンプトと使用モデルの定義）
AGENTS = {
    'ceo': {
        'model': 'llama3', 
        'system': 'あなたはAI企業の社長（CEO）です。戦略的な判断を下し、必要な場合は他のAIにタスクを委譲してください。'
    },
    'security': {
        'model': 'mistral', 
        'system': 'あなたはセキュリティ専門家です。システムやコードの脆弱性をチェックし、安全性を担保してください。'
    },
    'developer': {
        'model': 'qwen2', 
        'system': 'あなたは天才プログラマーです。要件に従って高品質なコードを生成してください。'
    },
    'pr': {
        'model': 'gemma2:9b', 
        'system': 'あなたは広報担当です。外部向けの魅力的な文章やレポートを作成してください。'
    },
    'reviewer': {
        'model': 'phi3:medium', 
        'system': 'あなたは品質管理の監査役です。他のAIの出力を論理的にレビューし、問題があれば指摘してください。'
    },
    'curator': {
        'model': 'mistral-nemo', 
        'system': 'あなたは学習・ナレッジ管理担当です。完了したタスクから有益な成功パターン（スキル）を抽出してください。'
    }
}

def ollama_generate(model, system_prompt, user_prompt):
    """ローカルのOllamaにリクエストを送り、確実にJSONフォーマットで回答を得る"""
    
    # AIの回答を構造化（パース可能）にするための厳密なフォーマット指定
    json_instruction = """
必ず以下のJSONフォーマットのみで、日本語で回答してください。
{
  "action": "complete" | "delegate" | "request_review",
  "summary": "実施した内容の具体的な要約（日本語で、何をしてどうなったかを詳細に記述すること）",
  "payload": {"key": "value"} (次工程で必要な構造化データがあれば含める。無ければ空のオブジェクト{}),
  "target_agent": "ceo|security|developer|pr|reviewer" (delegate/request_reviewの場合のみ),
  "subtask_description": "次のAIへの具体的な指示内容（日本語）" (delegate/request_reviewの場合のみ)
}
"""
    messages = [
        {"role": "system", "content": system_prompt + json_instruction + "必ず日本語で思考し、日本語で回答してください。"},
        {"role": "user", "content": user_prompt}
    ]
    
    # format: json オプションでOllama側でもJSON出力を強制
    data = {"model": model, "messages": messages, "stream": False, "format": "json"}
    req = urllib.request.Request(OLLAMA_URL, data=json.dumps(data).encode('utf-8'),
                                 headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=300) as response:
            result = json.loads(response.read().decode('utf-8'))
            content = result['message']['content']
            return json.loads(content) # 文字列をさらにJSON(dict)としてパース
    except urllib.error.URLError as e:
        print(f"❌ Ollama接続エラー (起動していますか？): {e}")
        raise
    except Exception as e:
        print(f"❌ Ollama推論/パースエラー: {e}")
        raise

def the_loop():
    """企業OSの心臓部（The Loop）。24時間TODOを監視し、AIに処理させる"""
    print("\n🔄 The Loop (Corporate OS Engine) started...")
    print("   [待機中] TODOタスクの発生を監視しています...\n")
    
    while True:
        try:
            task = db.get_todo_task()
            if not task:
                time.sleep(5) # タスクが無ければ5秒休んで再確認
                continue
                
            task_id = task['id']
            assignee = task['assignee']
            print(f"🚀 [TASK START] ID: {task_id[:8]}... | 担当: {assignee} | タイトル: {task['title']}")
            
            # 存在しないエージェントへの割り当てフェイルセーフ
            if assignee not in AGENTS:
                print(f"⚠️ 未知のエージェント: {assignee}")
                db.update_task_status(task_id, 'ESCALATED', reason=f'Unknown agent: {assignee}')
                continue
                
            agent_config = AGENTS[assignee]
            
            # ステータスを「進行中」に更新
            db.update_task_status(task_id, 'IN_PROGRESS')
            
            # AIへ渡す文脈（プロンプト）の構築
            prompt = f"【タスク】\n{task['title']}\n\n【詳細】\n{task['description']}\n\n"
            if task['context_summary']:
                prompt += f"【引き継ぎ情報（要約）】\n{task['context_summary']}\n\n"
            if task['context_payload'] and task['context_payload'] != "{}":
                prompt += f"【引き継ぎデータ（機械読取用）】\n{task['context_payload']}\n"
                
            print(f"🧠 Ollama ({agent_config['model']}) 推論中...")
            
            # 推論実行 (The Loopの中心)
            result_json = ollama_generate(agent_config['model'], agent_config['system'], prompt)
            
            action = result_json.get('action')
            print(f"✅ 推論完了: 選択されたアクション = [{action}]")
            
            # 結果に基づく状態遷移（ルーティング）
            if action == 'complete':
                db.update_task_status(task_id, 'DONE', result=result_json)
                print("   -> タスク完了 (DONE)")
                
            elif action in ['delegate', 'request_review']:
                depth = task['delegation_depth']
                
                # 無限ループ防止装置（ハードリミット）
                if depth >= task['max_retries']:
                    print(f"⚠️ デリゲーション深度（{depth}）が上限に達しました。人間へエスカレーションします。")
                    db.update_task_status(task_id, 'ESCALATED', reason='max_depth_exceeded', result=result_json)
                else:
                    target_agent = result_json.get('target_agent', 'ceo')
                    subtask_desc = result_json.get('subtask_description', 'No description provided')
                    
                    print(f"   -> {target_agent} へタスクを委譲 (Depth: {depth + 1})")
                    
                    # サブタスク（次工程）を作成
                    new_task_id = db.create_task(
                        title=f"{task['title']} の次工程",
                        description=subtask_desc,
                        assignee=target_agent,
                        context_summary=result_json.get('summary', ''),
                        context_payload=result_json.get('payload', {}),
                        parent_id=task_id
                    )
                    
                    # 委譲回数を引き継ぐ
                    db.update_delegation_depth(new_task_id, depth + 1)
                    
                    # 現在のタスクは役目を終えたので完了とする
                    db.update_task_status(task_id, 'DONE', result=result_json)
            else:
                print(f"⚠️ 不明なアクション: {action}")
                db.update_task_status(task_id, 'ESCALATED', reason=f"Unknown action: {action}", result=result_json)

        except Exception as e:
            print(f"❌ Loop Error: {e}")
            if 'task_id' in locals():
                try:
                    db.update_task_status(task_id, 'ESCALATED', reason=str(e))
                    print("   -> タスクを人間へエスカレーションしました")
                except:
                    pass
            time.sleep(5)


# --- Nexus Portal (ブラウザUI) と通信するための APIサーバー ---
class APIHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*') # CORS許可
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/tasks':
            self._set_headers()
            tasks = db.get_all_tasks()
            self.wfile.write(json.dumps(tasks, ensure_ascii=False).encode('utf-8'))
        elif self.path == '/api/health':
            self._set_headers()
            self.wfile.write(json.dumps({"status": "ok", "engine": "running"}).encode('utf-8'))
        else:
            # 簡易的な静的ファイルサーバーとして機能させる（CORS対策）
            file_path = self.path.lstrip('/')
            if not file_path:
                file_path = 'boardroom.html'
                
            abs_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), file_path)
            
            if os.path.exists(abs_path) and os.path.isfile(abs_path):
                self.send_response(200)
                if file_path.endswith('.html'):
                    self.send_header('Content-type', 'text/html; charset=utf-8')
                elif file_path.endswith('.css'):
                    self.send_header('Content-type', 'text/css; charset=utf-8')
                elif file_path.endswith('.js'):
                    self.send_header('Content-type', 'application/javascript; charset=utf-8')
                self.end_headers()
                with open(abs_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Not Found"}).encode('utf-8'))
                
    def do_POST(self):
        if self.path == '/api/tasks':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                title = data.get('title', 'Untitled Task')
                description = data.get('description', '')
                assignee = data.get('assignee', 'ceo')
                
                # DBにタスクを作成
                task_id = db.create_task(title=title, description=description, assignee=assignee)
                
                self._set_headers(201)
                self.wfile.write(json.dumps({"status": "success", "id": task_id}).encode('utf-8'))
            except Exception as e:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not Found"}).encode('utf-8'))
def start_api_server():
    port = 8080
    server = HTTPServer(('127.0.0.1', port), APIHandler)
    print(f"🌐 API Server (Nexus Portal連携用) 起動: http://127.0.0.1:{port}")
    server.serve_forever()

if __name__ == '__main__':
    # データベースの初期化確認
    if not os.path.exists(db.DB_PATH):
        db.init_db()

    # APIサーバーをバックグラウンドスレッドで起動
    api_thread = threading.Thread(target=start_api_server, daemon=True)
    api_thread.start()
    
    # メインスレッドで The Loop を実行
    the_loop()

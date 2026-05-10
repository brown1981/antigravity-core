import os
import json
import hmac
import hashlib
import base64
import urllib.request
import ssl
import sys
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from dotenv import load_dotenv

# ai_corp_v1 へのパスを追加し、インポート
ai_corp_path = os.path.join(os.path.dirname(__file__), '..', 'ai_corp_v1')
if ai_corp_path not in sys.path:
    sys.path.append(ai_corp_path)

# ai_corp_v1 の .env (Gemini APIキー等) を手動で読み込む
load_dotenv(os.path.join(ai_corp_path, '.env'))

from agents import CEO, CMO, CTO, CFO, CDO, CLO, CSO
from company import BoardMeeting

# LINE関連 .env の読み込み
def load_env():
    env_vars = {}
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, val = line.strip().split('=', 1)
                    env_vars[key] = val.strip('"\'')
    return env_vars

ENV = load_env()
LINE_CHANNEL_SECRET = ENV.get('LINE_CHANNEL_SECRET', '')
LINE_CHANNEL_ACCESS_TOKEN = ENV.get('LINE_CHANNEL_ACCESS_TOKEN', '')
LINE_ADMIN_USER_ID = ENV.get('LINE_ADMIN_USER_ID', '')

def push_message(text):
    if not LINE_ADMIN_USER_ID:
        print("❌ LINE_ADMIN_USER_ID が未設定のためプッシュ通知できません。")
        return
        
    url = 'https://api.line.me/v2/bot/message/push'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {LINE_CHANNEL_ACCESS_TOKEN}'
    }
    data = {
        'to': LINE_ADMIN_USER_ID,
        'messages': [{'type': 'text', 'text': text}]
    }
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
    try:
        urllib.request.urlopen(req, context=ctx)
        print("✅ プッシュ通知(AI会議結果)を送信しました")
    except Exception as e: # Catch any kind of URL error
        print("❌ プッシュ送信エラー:", getattr(e, 'read', lambda: str(e))())


def run_ai_corp_meeting(agenda):
    print(f"🔄 バックグラウンドでAI会議を開始します: {agenda}")
    try:
        agents_list = [CEO(), CMO(), CTO(), CFO(), CDO(), CLO(), CSO()]
        my_corp = BoardMeeting("Antigravity Innovation Inc.", agents_list)
        
        meeting_logs = []
        generator = my_corp.run(agenda)
        for officer, response in generator:
            if response == "CEO_TURN":
                continue
            meeting_logs.append(f"[{officer.role}]\n{response}")
            print(f"[{officer.role}] の発言完了")
        
        final_output = f"【AI会議結果レポート】\n議題: {agenda}\n\n"
        for log in meeting_logs:
            final_output += log + "\n\n---\n\n"
        
        # LINEのテキスト上限(5000字)を考慮し、安全に4000文字でカット
        if len(final_output) > 4000:
            final_output = final_output[:3900] + "\n\n... (文字数超過のため以下略)"
        
        push_message(final_output)
    except Exception as e:
        print(f"❌ 会議エラー: {str(e)}")
        push_message(f"⚠️ AI会議中にエラーが発生しました。\n詳細: {str(e)}")


def send_reply(reply_token, text):
    url = 'https://api.line.me/v2/bot/message/reply'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {LINE_CHANNEL_ACCESS_TOKEN}'
    }
    data = {
        'replyToken': reply_token,
        'messages': [{'type': 'text', 'text': text}]
    }
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
    
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        urllib.request.urlopen(req, context=ctx)
        print("✅ リプライを送信しました:", text)
    except Exception as e:
        print("❌ リプライ送信エラー:", getattr(e, 'read', lambda: str(e))())


class LineWebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/webhook':
            self.send_response(404)
            self.end_headers()
            return

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        signature = self.headers.get('x-line-signature', '')

        hash_val = hmac.new(LINE_CHANNEL_SECRET.encode('utf-8'), body, hashlib.sha256).digest()
        if base64.b64encode(hash_val).decode('utf-8') != signature:
            print("❌ 署名検証エラー")
            self.send_response(401)
            self.end_headers()
            return

        self.send_response(200)
        self.end_headers()

        data = json.loads(body.decode('utf-8'))
        for event in data.get('events', []):
            if event['type'] == 'message' and event['message']['type'] == 'text':
                user_message = event['message']['text']
                reply_token = event['replyToken']
                
                print(f"📩 受信メッセージ: {user_message}")
                
                if user_message in ['承認', '👍']:
                    send_reply(reply_token, '【システム】承認を受け付けました。保留していたAIの作業を再開します...🚀')
                elif user_message in ['却下', '✖️']:
                    send_reply(reply_token, '【システム】却下を受け付けました。該当タスクを破棄します。')
                elif '監査' in user_message or '報告' in user_message:
                    report_path = "/Users/ooshirokazuki2/.gemini/antigravity/scratch/quant-backend/WEEKLY_AUDIT_REPORT.md"
                    if os.path.exists(report_path):
                        with open(report_path, 'r', encoding='utf-8') as f:
                            report_content = f.read()
                        
                        send_reply(reply_token, "【監査会議】最新の修行報告書を読み込みました。ただいまより、この数値を基に役員会議（戦略評価）を開始します。")
                        
                        agenda = f"理系専務からの最新修行報告に基づく戦略評価会議。レポート内容：\n\n{report_content}"
                        t = threading.Thread(target=run_ai_corp_meeting, args=(agenda,))
                        t.start()
                    else:
                        send_reply(reply_token, "【システム】まだ有効な修行報告書（WEEKLY_AUDIT_REPORT.md）が生成されていません。先にバックエンドでレポートを生成してください。")
                elif '進捗' in user_message:
                    send_reply(reply_token, '【状況報告】現在、サブAI部隊が修行結果の集計を並行して実行中です。')
                else:
                    send_reply(reply_token, f"【指示受付】社長からの議題「{user_message}」を受理しました。会議を開始します。")
                    t = threading.Thread(target=run_ai_corp_meeting, args=(user_message,))
                    t.start()

def run(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, LineWebhookHandler)
    print(f"🚀 LINE Bot x AI Corp 連携サーバーが起動しました。ポート: {port}")
    print("外部からアクセスするためのトンネルURLをLINE Developersに登録してください。")
    httpd.serve_forever()

if __name__ == '__main__':
    run()

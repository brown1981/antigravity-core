import os
import json
import urllib.request
import ssl
# .envを読み込む
env_path = os.path.join(os.path.dirname(__file__), '.env')
env = {}
with open(env_path) as f:
    for line in f:
        if line.strip() and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            env[k] = v.strip('"\'')

ACCESS_TOKEN = env.get('LINE_CHANNEL_ACCESS_TOKEN', '')
USER_ID = env.get('LINE_ADMIN_USER_ID', '')

url = 'https://api.line.me/v2/bot/message/push'
headers = {
    'Content-Type': 'application/json',
    'Authorization': f"Bearer {ACCESS_TOKEN}"
}

# 送信する「ボタン付き」メッセージのデータ
data = {
    'to': USER_ID,
    'messages': [{
        'type': 'text',
        'text': '⚠️ 【社長へ緊急確認】（テスト通知）\nAI営業担当が「新規顧客への特別割引プラン（10%OFF）」の提案を保留しています。\nこのまま提案を続行してもよろしいでしょうか？',
        'quickReply': {
            'items': [
                {'type': 'action', 'action': {'type': 'message', 'label': '👍 承認して続行', 'text': '承認'}},
                {'type': 'action', 'action': {'type': 'message', 'label': '✖️ 却下して中止', 'text': '却下'}}
            ]
        }
    }]
}

# Mac特有のSSL証明書エラーを回避するための設定
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
    urllib.request.urlopen(req, context=ctx)
    print("✅ プッシュ通知を送信しました！スマホをご確認ください！")
except Exception as e:
    print("❌ 送信エラー:", getattr(e, 'read', lambda: str(e))())

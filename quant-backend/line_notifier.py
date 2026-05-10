import os
import json
import urllib.request
import ssl
import logging

# LINEサーバー側の.envパスを特定
LINE_ENV_PATH = "/Users/ooshirokazuki2/.gemini/antigravity/scratch/line-agent-controller/.env"

logger = logging.getLogger(__name__)

def send_line_push(text):
    """理系専務から社長へのLINE通知実行"""
    try:
        # .envの読み込み
        env = {}
        if not os.path.exists(LINE_ENV_PATH):
            logger.error(f"LINE Config Not Found at {LINE_ENV_PATH}")
            return False

        with open(LINE_ENV_PATH) as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    k, v = line.strip().split('=', 1)
                    env[k] = v.strip('"\'')

        access_token = env.get('LINE_CHANNEL_ACCESS_TOKEN', '')
        user_id = env.get('LINE_ADMIN_USER_ID', '')

        if not access_token or not user_id:
            logger.error("LINE Credentials Missing in .env")
            return False

        url = 'https://api.line.me/v2/bot/message/push'
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f"Bearer {access_token}"
        }
        data = {
            'to': user_id,
            'messages': [{'type': 'text', 'text': text}]
        }

        # SSL / Mac対応
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
        urllib.request.urlopen(req, context=ctx)
        logger.info("✅ LINE通知を送信しました")
        return True

    except Exception as e:
        logger.error(f"LINE通知エラー: {e}")
        return False

if __name__ == "__main__":
    # テスト用
    send_line_push("【理系専務 起動テスト】\n社長、バックエンド側の通知システムが正常にリンクされました。これより市場の自己監査結果を随時報告いたします。")

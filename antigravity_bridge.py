#!/usr/bin/env python3
"""Antigravity Bridge - サンドボックスとクラウドLLMを繋ぐ中継局"""

import http.server
import json
import urllib.request
import urllib.error
import ssl
import os

LISTEN_PORT = 8888
GROQ_API_KEY = None

def load_api_key():
    global GROQ_API_KEY
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if 'GROQ_API_KEY' in line and '=' in line:
                    GROQ_API_KEY = line.strip().split('=', 1)[1]
    if not GROQ_API_KEY:
        GROQ_API_KEY = os.environ.get('GROQ_API_KEY')

class BridgeHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        req = urllib.request.Request(
            'https://api.groq.com/openai/v1/chat/completions',
            data=body,
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            method='POST'
        )
        try:
            ctx = ssl.create_default_context()
            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                data = resp.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())

    def log_message(self, fmt, *args):
        print(f"🛰️ [{self.log_date_time_string()}] {args[0]}")

if __name__ == '__main__':
    load_api_key()
    if not GROQ_API_KEY:
        print("❌ GROQ_API_KEY が .env に見つかりません"); exit(1)
    server = http.server.HTTPServer(('127.0.0.1', LISTEN_PORT), BridgeHandler)
    print(f"🌉 Antigravity Bridge 起動: http://127.0.0.1:{LISTEN_PORT}")
    print("   Ctrl+C で停止")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Bridge 停止")

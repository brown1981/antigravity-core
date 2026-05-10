import os
import json
import requests

def get_env():
    env_vars = {}
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                if "=" in line:
                    k, v = line.strip().split("=", 1)
                    env_vars[k] = v
    return env_vars

env = get_env()
api_key = env.get("GROQ_API_KEY")

if not api_key:
    print("❌ ERROR: GROQ_API_KEY not found.")
    exit(1)

url = "https://api.groq.com/openai/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

# 1.5兆パラメータ級の議論をシミュレートし、最終コードを生成
payload = {
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {"role": "system", "content": "あなたはAntigravity総監督です。6名の巨神の議論を統合し、最高品質の neural_bridge.py を出力せよ。"},
        {"role": "user", "content": "Step 1: Neural-Bridge (Python Gateway) の完全なソースコードを生成せよ。aiohttp, Queueing, ./archives/bridge.log 出力を実装。"}
    ]
}

print("👥 Connecting to Ghost Fleet...")
try:
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    data = response.json()
    code = data['choices'][0]['message']['content']
    
    os.makedirs("./archives", exist_ok=True)
    with open("./archives/neural_bridge.py", "w") as f:
        f.write(code)
    print("✅ SUCCESS: Code generated in ./archives/neural_bridge.py")
except Exception as e:
    print(f"❌ CONNECTION FAILED: {str(e)}")


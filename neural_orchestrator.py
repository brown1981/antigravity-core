import os
import json
import concurrent.futures
import urllib.request
import ssl

# SSL回避 (Mac環境)
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except AttributeError:
    pass

def load_env_manual():
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            for line in f:
                if "=" in line:
                    key, value = line.strip().split("=", 1)
                    os.environ[key.strip()] = value.strip()

load_env_manual()

OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")
GROQ_KEY = os.getenv("GROQ_API_KEY")

# ===== 新・精鋭四天王 (Local Elite 4) - 完全ローカル自律モード (v25.0) =====
AGENTS = {
    "shinbou": {"name": "深謀 (SHINBOU)", "provider": "ollama", "model": "gemma2:27b"},
    "kikou":   {"name": "機巧 (KIKOU)",   "provider": "ollama", "model": "qwen2.5:14b"},
    "hyoujin": {"name": "氷刃 (HYOUJIN)", "provider": "ollama", "model": "mistral-small:22b"},
    "kyoumei": {"name": "共鳴 (KYOUMEI)", "provider": "ollama", "model": "hermes3:8b"}
}

def call_llm(agent_id, user_input, blueprint=""):
    agent = AGENTS[agent_id]
    try:
        with open(f"agents/{agent_id}.txt", "r", encoding="utf-8") as f:
            system_prompt = f.read()
    except:
        return "憲法ファイル読み込み失敗"

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Content-Type": "application/json"
    }

    if agent["provider"] == "groq":
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers["Authorization"] = f"Bearer {GROQ_KEY}"
    elif agent["provider"] == "openrouter":
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers["Authorization"] = f"Bearer {OPENROUTER_KEY}"
        headers["HTTP-Referer"] = "https://antigravity.ai"
    elif agent["provider"] == "ollama":
        url = "http://127.0.0.1:11434/v1/chat/completions"

    payload = {
        "model": agent["model"],
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"【状況】{blueprint}\n\n【司令官の命令】{user_input}"}
        ]
    }

    try:
        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
        with urllib.request.urlopen(req, timeout=60) as res:
            data = json.loads(res.read())
            if 'choices' in data:
                return data['choices'][0]['message']['content']
            else:
                return f"API異常応答: {json.dumps(data)[:200]}"
    except Exception as e:
        return f"通信失敗: {str(e)}"

def run_orchestration(user_input, blueprint=""):
    print("--- Antigravity Elite 4 Core v25.0 (Local Override) ---")

    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_to_agent = {executor.submit(call_llm, aid, user_input, blueprint): aid for aid in AGENTS}
        for future in concurrent.futures.as_completed(future_to_agent):
            aid = future_to_agent[future]
            results[aid] = future.result()

    with open("TACTICAL_FEED.md", "w", encoding="utf-8") as f:
        f.write("# 🌪️ NEURAL FEED: REALTIME_ACTIVE_LOG\n---\n")
        f.write("### 🛰️ PANE [01]: LIVE_LLM_BROADCAST\n")
        f.write("**STATUS: ELITE_4_SYNCED (v25.0 Local)**\n\n")

        order = ["shinbou", "kikou", "hyoujin", "kyoumei"]
        icons = {"shinbou": "🧠", "kikou": "🛠️", "hyoujin": "🗡️", "kyoumei": "🎨"}

        for aid in order:
            content = results.get(aid, "沈黙...")
            f.write(f"**{icons[aid]} {AGENTS[aid]['name']}**: 「{content}」\n\n")

        f.write("---\n> [!IMPORTANT]\n> **DATA_SOURCE**: Antigravity Elite 4 Core (v25.0 Local).\n")

    print("--- 全員の発言をTACTICAL_FEED.mdに書き込みました ---")

if __name__ == "__main__":
    import sys
    run_orchestration(
        sys.argv[1] if len(sys.argv) > 1 else "現状報告。",
        sys.argv[2] if len(sys.argv) > 2 else "初期化完了。"
    )

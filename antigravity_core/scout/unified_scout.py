import urllib.request
import json
import os

# Antigravity | Unified Scout V2.0
# Dual-Source Search: GitHub (Knowledge) & Open VSX (Weaponry)

CORE_DIR = "/Users/ooshirokazuki2/.gemini/antigravity/scratch/antigravity_core"
SECRETS_PATH = os.path.join(CORE_DIR, "config/secrets.json")

def get_github_token():
    if os.path.exists(SECRETS_PATH):
        with open(SECRETS_PATH, 'r') as f:
            return json.load(f).get("GITHUB_PAT")
    return None

def search_github(query, token=None):
    print(f"[SCOUT] SCANNING GITHUB...")
    url = f"https://api.github.com/search/repositories?q={query}&sort=stars"
    headers = {"User-Agent": "Antigravity-Nexus"}
    if token:
        headers["Authorization"] = f"token {token}"
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read())['items'][:5]
    except:
        return []

def search_open_vsx(query):
    print(f"[SCOUT] SCANNING OPEN VSX (WEAPONRY SHOP)...")
    url = f"https://open-vsx.org/api/-/search?q={query}"
    headers = {"User-Agent": "Antigravity-Nexus"}
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read())['extensions'][:5]
    except:
        return []

def unified_report(query):
    token = get_github_token()
    gh = search_github(query, token)
    vsx = search_open_vsx(query)
    
    print("\n--- UNIFIED SCOUT REPORT ---")
    print(f"QUERY: {query}")
    
    print("\n[TOOLS from Open VSX]")
    for ext in vsx:
        print(f"- {ext['displayName']} ({ext['namespace']}): {ext['description'][:80]}...")
        
    print("\n[LOGIC from GitHub]")
    for repo in gh:
        print(f"- {repo['full_name']}: {repo['description'][:80]}...")

if __name__ == "__main__":
    unified_report("agentic automation")

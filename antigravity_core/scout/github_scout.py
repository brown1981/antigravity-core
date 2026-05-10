import urllib.request
import json
import datetime

# Antigravity | GitHub Skill Scout V1.0
# The Eyes of the Nexus

SEARCH_KEYWORDS = ["agentic-coding", "3d-svg-animation", "web-automation-ai"]

def scout_github(query):
    print(f"[SCOUT] SEARCHING GITHUB FOR: {query}")
    # Basic search logic using GitHub Search API (Public / No Auth by default)
    url = f"https://api.github.com/search/repositories?q={query}&sort=stars&order=desc"
    
    headers = {"User-Agent": "Antigravity-AI-Agent"}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            items = data.get('items', [])[:3] # Get top 3
            return items
    except Exception as e:
        print(f"[SCOUT] Search Failed: {e}")
        return []

def report_findings():
    print("--- WEEKLY SKILL SCOUT REPORT ---")
    all_findings = []
    for kw in SEARCH_KEYWORDS:
        found = scout_github(kw)
        all_findings.extend(found)
    
    if not all_findings:
        print("[SCOUT] Nothing new under the sun today.")
    else:
        for item in all_findings:
            print(f"- {item['full_name']}: {item['description']} ({item['stargazers_count']} stars)")
    
    print("--- SCOUT REPORT COMPLETE ---")

if __name__ == "__main__":
    report_findings()

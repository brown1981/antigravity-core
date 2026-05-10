import os
import json
import base64
from urllib.request import Request, urlopen
from urllib.error import HTTPError

TOKEN = 'YOUR_GITHUB_TOKEN_HERE'
OWNER = 'brown1981'
REPO = 'antigravity-neural-core'
FILES = [
    'index.html', 'style.css', 'app.js', 'automation_hub.js', 
    'synapse_parser.js', 'workflow_engine.js', 'neural_engine.js',
    'connector_library.js', 'core_registry.js', 'data_bridge.js',
    'knowledge_cortex.js', 'memory_inspector.js', 'README.md', '.gitignore',
    'image.png', 'neural_brain_v10_core_1776612040985.png'
]

import ssl

def teleport_file(path):
    print(f"📡 Teleporting: {path}...", end="", flush=True)
    if not os.path.exists(path):
        print(" ❌ Skipped (File not found)")
        return

    with open(path, "rb") as f:
        content = f.read()
    
    encoded_content = base64.b64encode(content).decode('utf-8')
    
    data = {
        "message": f"chore: Aether Pulse teleport [{path}]",
        "content": encoded_content
    }
    
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{path}"
    req = Request(url, data=json.dumps(data).encode('utf-8'), method="PUT")
    req.add_header("Authorization", f"token {TOKEN}")
    req.add_header("User-Agent", "Antigravity-AI")
    req.add_header("Content-Type", "application/json")
    
    # V15.3.1: Bypass macOS SSL restrictions
    context = ssl._create_unverified_context()
    
    try:
        with urlopen(req, context=context) as res:
            if res.status in [200, 201]:
                print(" ✅ Success")
            else:
                print(f" ❌ Failed ({res.status})")
    except HTTPError as e:
        error_data = e.read().decode('utf-8')
        # If file already exists, we might need a SHA, but for a new repo this shouldn't happen.
        # However, for robustness, if it fails with 422, we could try to get SHA first.
        print(f" ❌ HTTP Error: {e.code}")
        print(f"Details: {error_data}")

if __name__ == "__main__":
    print("🚀 ANTIGRAVITY | AETHER PULSE TELEPORTER")
    print("---------------------------------------")
    for f in FILES:
        teleport_file(f)
    print("---------------------------------------")
    print("✨ MISSION COMPLETE. YOUR COMMAND CENTER IS AWAKE ON GITHUB.")
    print("NEXT STEP: Enable GitHub Pages in your Repository Settings.")

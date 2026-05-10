import json
import time
import base64
import subprocess
import urllib.request
import os
import ssl

# AETHER PULSE: SSL bypass for macOS Python environments
ssl._create_default_https_context = ssl._create_unverified_context

# CONFIGURATION
KEY_FILE = "/Users/ooshirokazuki2/.gemini/antigravity/scratch/credentials/antigravity-ih-key.json"
FOLDER_ID = "1SaQzXtvVl-XN-JVi1JL17anzXOO-v2Px"
WORKSPACE_PATH = "/Users/ooshirokazuki2/.gemini/antigravity/scratch"

def b64_encode(s):
    return base64.urlsafe_b64encode(s).decode('utf-8').replace('=', '')

def get_access_token(key_data):
    """Generate JWT and exchange for access token using openssl for signing."""
    header = b64_encode(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    
    now = int(time.time())
    payload = b64_encode(json.dumps({
        "iss": key_data["client_email"],
        "scope": "https://www.googleapis.com/auth/drive",
        "aud": "https://oauth2.googleapis.com/token",
        "exp": now + 3600,
        "iat": now
    }).encode())
    
    signing_input = f"{header}.{payload}"
    
    # Use openssl to sign the input
    with open("signing_input.tmp", "w") as f:
        f.write(signing_input)
    
    # Extract private key to a temporary file
    with open("private_key.pem", "w") as f:
        f.write(key_data["private_key"])
        
    cmd = ["openssl", "dgst", "-sha256", "-sign", "private_key.pem", "signing_input.tmp"]
    signature_bytes = subprocess.check_output(cmd)
    signature = b64_encode(signature_bytes)
    
    # Cleanup temp files
    os.remove("signing_input.tmp")
    os.remove("private_key.pem")
    
    jwt = f"{header}.{payload}.{signature}"
    
    # Exchange JWT for Access Token
    data = f"grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion={jwt}".encode()
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data)
    with urllib.request.urlopen(req) as res:
        return json.load(res)["access_token"]

def upload_to_drive(token, filename, content, mime_type="application/json"):
    """Upload content to specified Google Drive folder."""
    metadata = {
        "name": filename,
        "parents": [FOLDER_ID]
    }
    
    boundary = "-------314159265358979323846"
    body = (
        f"--{boundary}\r\n"
        f"Content-Type: application/json; charset=UTF-8\r\n\r\n"
        f"{json.dumps(metadata)}\r\n"
        f"--{boundary}\r\n"
        f"Content-Type: {mime_type}\r\n\r\n"
        f"{content}\r\n"
        f"--{boundary}--\r\n"
    ).encode('utf-8')
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": f"multipart/related; boundary={boundary}"
    }
    
    req = urllib.request.Request(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true",
        data=body,
        headers=headers
    )
    try:
        with urllib.request.urlopen(req) as res:
            return json.load(res)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        try:
            parsed_error = json.loads(error_body)
            message = parsed_error.get('error', {}).get('message', 'Unknown error')
            reason = parsed_error.get('error', {}).get('errors', [{}])[0].get('reason', 'Unknown reason')
            raise Exception(f"Google API Error: {message} (Reason: {reason})")
        except:
            raise Exception(f"HTTP {e.code}: {error_body}")

def harvest_project_status():
    """Collect local project files and create an intelligence packet."""
    print("🛰️ Harvesting local project intelligence...")
    
    data = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "files": {}
    }
    
    target_files = ["TACTICAL_FEED.md", "GLOBAL_RULES.md"]
    for f_name in target_files:
        path = os.path.join(WORKSPACE_PATH, f_name)
        if os.path.exists(path):
            with open(path, "r") as f:
                data["files"][f_name] = f.read()
    
    return json.dumps(data, indent=2)

if __name__ == "__main__":
    try:
        with open(KEY_FILE, "r") as f:
            key_data = json.load(f)
            
        token = get_access_token(key_data)
        print("🔑 Authentication Successful.")
        
        packet = harvest_project_status()
        filename = f"INTELLIGENCE_PACKET_{time.strftime('%Y%m%d_%H%M%S')}.json"
        
        result = upload_to_drive(token, filename, packet)
        print(f"🚀 Upload Successful: {result['name']} (ID: {result['id']})")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

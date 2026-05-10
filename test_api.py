import urllib.request
import json

try:
    req = urllib.request.Request('http://127.0.0.1:8080/api/tasks')
    with urllib.request.urlopen(req, timeout=5) as response:
        data = response.read().decode('utf-8')
        print(f"HTTP Response Code: {response.getcode()}")
        print(f"Data length: {len(data)}")
        print(f"Data: {data}")
        json_data = json.loads(data)
        print(f"Parsed JSON length: {len(json_data)}")
except Exception as e:
    print(f"Error fetching API: {e}")

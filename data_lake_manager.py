import os
import json
import datetime

LAKE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data_lake', 'raw_data')
EXPORT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data_lake', 'exports')

os.makedirs(LAKE_DIR, exist_ok=True)
os.makedirs(EXPORT_DIR, exist_ok=True)

def write_to_lake(app_id, data_dict):
    """
    独立したアプリからデータレイクに非同期でデータを書き込む。
    app_id: アプリ識別子 (例: '01_mood_orbit')
    data_dict: 保存するデータ(dict)
    """
    timestamp = datetime.datetime.now().isoformat()
    payload = {
        "timestamp": timestamp,
        "app_id": app_id,
        "data": data_dict
    }
    
    file_path = os.path.join(LAKE_DIR, f"{app_id}.json")
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"DataLake Write Error [{app_id}]: {e}")
        return False

def read_from_lake(app_id):
    """
    AI会社（Hermes）がデータレイクから最新のデータを非同期で読み出す。
    """
    file_path = os.path.join(LAKE_DIR, f"{app_id}.json")
    if not os.path.exists(file_path):
        return None
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"DataLake Read Error [{app_id}]: {e}")
        return None

def get_all_lake_data():
    """
    AI会社の全体会議（Board Meeting）用に、全アプリの最新データを一括取得する。
    """
    aggregated_data = {}
    for filename in os.listdir(LAKE_DIR):
        if filename.endswith('.json'):
            app_id = filename.replace('.json', '')
            data = read_from_lake(app_id)
            if data:
                aggregated_data[app_id] = data
    return aggregated_data

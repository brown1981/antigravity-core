import json
import antigravity_db as db

try:
    tasks = db.get_all_tasks()
    print("Tasks fetched successfully")
    print(tasks)
    json_str = json.dumps(tasks, ensure_ascii=False)
    print("JSON dumped successfully")
except Exception as e:
    print(f"ERROR: {e}")

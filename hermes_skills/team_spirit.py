import sqlite3
import os
import json

def get_team_sync():
    """
    各AIエージェントの活動状況と同期レベルを計算します。
    (Team Spirit の移植版)
    """
    base_path = os.path.dirname(os.path.dirname(__file__))
    db_path = os.path.join(base_path, 'antigravity.db')
    
    agents = ['zero', 'shinbou', 'hyoujin', 'shingun', 'librarian', 'kikou']
    stats = {}
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        for agent in agents:
            # 各エージェントの完了タスク数をカウント
            cursor.execute("SELECT COUNT(*) FROM tasks WHERE assignee = ? AND status = 'DONE'", (agent,))
            count = cursor.fetchone()[0]
            
            # 同期レベルのシミュレーション (活動量に基づく)
            sync_level = min(100, 70 + (count * 2))
            stats[agent] = {
                'tasks_completed': count,
                'sync_level': sync_level,
                'status': "OPTIMAL" if sync_level > 80 else "SYNCHRONIZING"
            }
            
        conn.close()
    except Exception as e:
        return json.dumps({'error': str(e)})

    return json.dumps(stats, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print(get_team_sync())

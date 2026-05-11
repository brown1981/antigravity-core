import os
import sqlite3
import json

def get_knowledge_summary():
    """
    蓄積された知識アーカイブ（過去のタスク）の統計と最新トピックを報告します。
    (Intelligence Hub の移植版)
    """
    base_path = os.path.dirname(os.path.dirname(__file__))
    db_path = os.path.join(base_path, 'antigravity.db')
    
    summary = {
        'total_reports': 0,
        'latest_topics': [],
        'harvester_status': 'ACTIVE'
    }
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 過去の哨戒レポート(DONEタスク)の総数を取得
        cursor.execute("SELECT COUNT(*) FROM tasks WHERE status = 'DONE'")
        summary['total_reports'] = cursor.fetchone()[0]
        
        # 最新の3件のタイトルをトピックとして抽出
        cursor.execute("SELECT title FROM tasks WHERE status = 'DONE' ORDER BY created_at DESC LIMIT 3")
        summary['latest_topics'] = [row[0] for row in cursor.fetchall()]
        
        conn.close()
    except:
        summary['harvester_status'] = 'ERROR'

    return json.dumps(summary, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print(get_knowledge_summary())

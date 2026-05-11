import sqlite3
import os
import uuid
import json
from datetime import datetime

# データベースファイルのパス (antigravity_bridge.pyと同じディレクトリ)
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'antigravity.db')

def get_connection():
    """SQLiteデータベースへの接続を取得し、WALモードを有効にする。テーブルがない場合は自動作成する。"""
    is_new = not os.path.exists(DB_PATH)
    conn = sqlite3.connect(DB_PATH, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA journal_mode=WAL;')
    
    # 物理ファイルがないか、テーブルがない場合に初期化を実行
    try:
        conn.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='tasks'")
    except:
        init_db()
        
    return conn


def init_db():
    """スキーマの初期化（テーブルの作成）"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('BEGIN')
    try:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                status TEXT CHECK(status IN ('TODO', 'IN_PROGRESS', 'REVIEW', 'ESCALATED', 'DONE')) DEFAULT 'TODO',
                assignee TEXT,
                context_summary TEXT,
                context_payload TEXT,
                result TEXT,
                delegation_depth INTEGER DEFAULT 0,
                max_retries INTEGER DEFAULT 3,
                parent_task_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS skills (
                id TEXT PRIMARY KEY,
                tags TEXT,
                condition TEXT,
                procedure TEXT,
                source_task_id TEXT,
                status TEXT CHECK(status IN ('DRAFT', 'APPROVED', 'RETIRED')) DEFAULT 'DRAFT',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                actor TEXT,
                action TEXT,
                target_id TEXT,
                detail TEXT
            )
        ''')
        cursor.execute('COMMIT')
        print(f"✅ データベース初期化完了: {DB_PATH}")
    except Exception as e:
        cursor.execute('ROLLBACK')
        print(f"❌ データベース初期化エラー: {e}")
        raise
    finally:
        conn.close()

def log_audit(cursor, actor, action, target_id, detail_dict=None):
    """監査ログを記録する（トランザクション内で呼ばれる想定）"""
    detail_str = json.dumps(detail_dict, ensure_ascii=False) if detail_dict else None
    cursor.execute('''
        INSERT INTO audit_log (actor, action, target_id, detail)
        VALUES (?, ?, ?, ?)
    ''', (actor, action, target_id, detail_str))

def create_task(title, description, assignee, context_summary="", context_payload=None, parent_id=None):
    """新規タスクを作成し、監査ログを残す"""
    conn = get_connection()
    cursor = conn.cursor()
    task_id = str(uuid.uuid4())
    payload_str = json.dumps(context_payload, ensure_ascii=False) if context_payload else "{}"
    
    try:
        cursor.execute('BEGIN')
        cursor.execute('''
            INSERT INTO tasks (id, title, description, assignee, context_summary, context_payload, parent_task_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (task_id, title, description, assignee, context_summary, payload_str, parent_id))
        
        log_audit(cursor, 'human_or_system', 'task_created', task_id, {"title": title, "assignee": assignee})
        cursor.execute('COMMIT')
        export_to_js() # JSへの書き出し
        print(f"✅ タスク作成完了: {task_id} ({title})")
        return task_id
    except Exception as e:
        cursor.execute('ROLLBACK')
        print(f"❌ タスク作成エラー: {e}")
        raise
    finally:
        conn.close()

def get_todo_task():
    """実行待ちのタスクを1件取得する"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tasks WHERE status = "TODO" ORDER BY created_at ASC LIMIT 1')
    task = cursor.fetchone()
    conn.close()
    return dict(task) if task else None

def export_to_js():
    """全タスクを tasks_data.js として書き出し、サーバーレスでUIと同期する"""
    tasks = get_all_tasks()
    js_content = f"window.ANTIGRAVITY_TASKS = {json.dumps(tasks, ensure_ascii=False, indent=2)};"
    js_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tasks_data.js')
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    # print(f"📊 UIデータ同期完了: {js_path}")

def get_all_tasks():
    """全タスクを取得する（UI用）"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tasks ORDER BY created_at DESC')
    tasks = cursor.fetchall()
    conn.close()
    return [dict(t) for t in tasks]

def update_task_status(task_id, new_status, actor="engine", reason=None, result=None):
    """タスクのステータスを更新し、結果を保存する"""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('BEGIN')
        result_str = json.dumps(result, ensure_ascii=False) if result else None
        
        if result_str:
            cursor.execute('''
                UPDATE tasks 
                SET status = ?, result = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (new_status, result_str, task_id))
        else:
            cursor.execute('''
                UPDATE tasks 
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (new_status, task_id))
            
        log_audit(cursor, actor, 'status_updated', task_id, {"new_status": new_status, "reason": reason})
        cursor.execute('COMMIT')
        export_to_js() # JSへの書き出し
    except Exception as e:
        cursor.execute('ROLLBACK')
        raise
    finally:
        conn.close()

def update_delegation_depth(task_id, new_depth):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('BEGIN')
        cursor.execute('UPDATE tasks SET delegation_depth = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', (new_depth, task_id))
        cursor.execute('COMMIT')
    except Exception as e:
        cursor.execute('ROLLBACK')
        raise
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()

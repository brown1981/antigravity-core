import sqlite3
import os
import sys
from datetime import datetime

# データベースファイルのパスを絶対パスで固定
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'antigravity_v4.db')

def get_connection():
    """SQLiteデータベースへの接続を取得し、WALモードを有効にする。"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        return conn
    except Exception as e:
        print(f"❌ [DB] Connection Error: {e}")
        raise

def init_db():
    """データベースのテーブルを初期化する。"""
    print(f"📡 [DB] Initializing database at: {DB_PATH}")
    conn = get_connection()
    try:
        cursor = conn.cursor()
        # tasksテーブルの作成
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                instruction TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                result TEXT,
                agent_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        # 確認用のSELECT
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'")
        if cursor.fetchone():
            print("✅ [DB] Table 'tasks' confirmed and ready.")
        else:
            print("❌ [DB] Table 'tasks' creation FAILED.")
    except Exception as e:
        print(f"❌ [DB] Init Error: {e}")
    finally:
        conn.close()

def create_task(instruction, agent_name="Hermes"):
    """新しいタスクを登録する"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO tasks (instruction, agent_name, status) VALUES (?, ?, ?)",
            (instruction, agent_name, 'executing')
        )
        conn.commit()
        return cursor.lastrowid
    except Exception as e:
        print(f"❌ [DB] create_task Error: {e}")
        # もしテーブルがないと言われたら、その場で初期化して再試行
        if "no such table" in str(e):
            init_db()
            return create_task(instruction, agent_name)
        raise
    finally:
        conn.close()

def get_all_tasks(limit=10):
    """最新のタスク一覧を取得する"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        if "no such table" in str(e):
            init_db()
            return []
        return []
    finally:
        if 'conn' in locals(): conn.close()

def update_task_result(task_id, result, status='completed'):
    """タスクの結果を更新する"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE tasks SET result = ?, status = ?, updated_at = ? WHERE id = ?",
            (result, status, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), task_id)
        )
        conn.commit()
    finally:
        conn.close()

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
        # タイムアウトを30秒に設定し、並列実行時のロック耐性を高める
        conn = sqlite3.connect(DB_PATH, timeout=30.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA busy_timeout = 30000")
        return conn
    except Exception as e:
        print(f"❌ [DB] Connection Error: {e}")
        raise

def init_db():
    """データベースのテーブルを初期化し、必要に応じてカラムを追加する。"""
    print(f"📡 [DB] Initializing database at: {DB_PATH}")
    conn = get_connection()
    try:
        cursor = conn.cursor()
        # tasksテーブルの作成 (title, description カラムを追加)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                description TEXT,
                instruction TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                result TEXT,
                agent_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 既存のテーブルにカラムがない場合の補完 (Migration)
        try:
            cursor.execute("ALTER TABLE tasks ADD COLUMN title TEXT")
        except: pass
        try:
            cursor.execute("ALTER TABLE tasks ADD COLUMN description TEXT")
        except: pass
            
        conn.commit()
        print("✅ [DB] Database schema is up to date.")
    except Exception as e:
        print(f"❌ [DB] Init Error: {e}")
    finally:
        conn.close()

import time

def create_task(instruction, agent_name="Hermes", title=None, description=None):
    """新しいタスクを登録する (リトライロジック付き)"""
    for attempt in range(5):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO tasks (instruction, agent_name, status, title, description) VALUES (?, ?, ?, ?, ?)",
                (instruction, agent_name, 'IN_PROGRESS', title, description)
            )
            conn.commit()
            last_id = cursor.lastrowid
            conn.close()
            return last_id
        except Exception as e:
            if "locked" in str(e).lower() and attempt < 4:
                time.sleep(0.5)
                continue
            print(f"❌ [DB] create_task Error: {e}")
            raise
    return None

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

def update_task_status(task_id, status, result=None):
    """タスクのステータスと結果を更新する"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE tasks SET status = ?, result = ?, updated_at = ? WHERE id = ?",
            (status, result, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), task_id)
        )
        conn.commit()
    finally:
        conn.close()

import os
import sys

# プロジェクトルートをパスに追加して antigravity_db を読み込めるようにする
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import antigravity_db as db

def post_to_boardroom(title, description, assignee, status='TODO'):
    """
    Boardroom UI (Nexus Portal) に新しいタスクを直接登録します。
    (Serverless Mode: DB経由で tasks_data.js を更新)
    """
    try:
        # DBにタスクを作成 (自動的に export_to_js() が呼ばれる)
        task_id = db.create_task(
            title=title,
            description=description,
            assignee=assignee
        )
        # ステータスが TODO 以外の場合は更新
        if status != 'TODO':
            db.update_task_status(task_id, status)
            
        return f"✅ Boardroom への登録成功: {title} (ID: {task_id[:8]})"
    except Exception as e:
        return f"❌ Boardroom への登録失敗: {str(e)}"

if __name__ == "__main__":
    # テスト投稿
    if len(sys.argv) > 3:
        print(post_to_boardroom(sys.argv[1], sys.argv[2], sys.argv[3]))
    else:
        print(post_to_boardroom("Hermes サーバーレス接続", "APIサーバーを介さず、直接DB同期に成功しました。", "kikou", "DONE"))

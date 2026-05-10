import antigravity_db as db

# 最初のテストタスクを作成
task_id = db.create_task(
    title="企業OSの起動テスト",
    description="こんにちは、社長。システムが正常に起動し、Ollamaと接続できているかテストします。このタスクを受け取ったら、適当な挨拶を要約に含めて「complete」アクションを返してください。",
    assignee="ceo"
)

print(f"テストタスクを投入しました: {task_id}")
print("エンジン（The Loop）が起動していれば、数秒後に自動で処理されます。")

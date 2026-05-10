import sys
import os
import sqlite3
import json

sys.path.append("/Users/ooshirokazuki2/.gemini/antigravity/scratch/ai_corp_v1")
from memory.archivist import run_archivist_hook

reports = [
    {"role": "CMO", "name": "Mira", "content": "市場調査の結果、リモートワークは人材確保に50%の好影響を与えます。"},
    {"role": "CFO", "name": "Kai", "content": "オフィスの縮小により、年間3000万円のコスト削減が見込めます。"}
]

print("Running archivist hook...")
run_archivist_hook(
    agenda="リモートワーク制度の無期限延長について",
    reports=reports,
    final_decision="リモートワーク制度の無期限延長を承認する。直ちにオフィス縮小計画を開始せよ。"
)

# データベースの確認
db_path = "/Users/ooshirokazuki2/.gemini/antigravity/scratch/memory.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT * FROM decisions")
rows = cursor.fetchall()
print(f"\nSaved decisions in memory.db: {len(rows)}")
for row in rows:
    print(f"ID: {row[0]}, Agenda: {row[2]}")
    print(f"Key Args: {row[3]}")
    print(f"Rationale: {row[5]}")
conn.close()

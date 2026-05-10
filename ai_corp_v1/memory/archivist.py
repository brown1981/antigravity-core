import os
import json
import sqlite3
import datetime
from litellm import completion

MEMORY_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../memory.db")

def init_db():
    conn = sqlite3.connect(MEMORY_DB_PATH)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS decisions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            agenda TEXT,
            key_arguments TEXT,
            final_decision TEXT,
            rationale TEXT
        )
    ''')
    conn.commit()
    conn.close()

def run_archivist_hook(agenda: str, reports: list, final_decision: str):
    """
    バックグラウンドで走る記録係（アーキビスト）。
    超安価なモデルを使って会議ログを構造化し、Decision DBに保存する。
    """
    init_db()
    
    print("\n  [📚 Archivist] 会議ログの構造化を開始...")
    
    # フォーマットの作成
    transcript = ""
    for r in reports:
         transcript += f"【{r.get('role', 'Unknown')}】: {r.get('content', '')[:200]}...\n" # Token節約のため冒頭のみ
         
    prompt = f"""
以下は役員会議の要約データです。
議題: {agenda}

各役員の意見概要:
{transcript}

CEOの最終決断:
{final_decision}

この会議から得られた教訓や主な論点を抽出し、以下の完全なJSONフォーマットのみ（マークダウン記法なし）で出力してください。
{{
    "key_arguments": "会議で出た主な対立点や重要な意見の要約(150文字程度)",
    "rationale": "CEOがその決断を下した理由や、今後の教訓(150文字程度)"
}}
    """
    
    # コスト重視のモデル選択: 常に無料または最安モデルを使用
    model_name = os.getenv("ARCHIVIST_MODEL", "openrouter/meta-llama/llama-3.1-8b-instruct:free")
    
    try:
        # 認証キーの強制ロード (Agentsクラスの仕組みを模倣)
        api_key = os.getenv("OPENROUTER_API_KEY", "").strip("'\" ")
        os.environ["OPENROUTER_API_KEY"] = api_key
        
        # モック環境の場合
        if os.getenv("ANY_MODEL_MOCK") == "true":
             result_text = '{"key_arguments": "モック論点", "rationale": "モック教訓"}'
        else:
             response = completion(
                 model=model_name,
                 messages=[{"role": "user", "content": prompt}],
                 api_key=api_key,
                 extra_headers={"HTTP-Referer": "http://localhost:9000", "X-Title": "AI Corp Management Portal"},
                 max_tokens=300,
                 temperature=0.1
             )
             result_text = response.choices[0].message.content.strip()

        # 不要なマークダウンを取り除く (```json ... ```等)
        if result_text.startswith("```"):
             result_text = "\n".join(result_text.split("\n")[1:-1])

        parsed = json.loads(result_text)
        key_arguments = parsed.get("key_arguments", "抽出失敗")
        rationale = parsed.get("rationale", "抽出失敗")

    except Exception as e:
        print(f"  [📚 Archivist Error] 構造化に失敗: {e}")
        key_arguments = "構造化エラー"
        rationale = "構造化エラー"
        
    ts = datetime.datetime.now().isoformat()
    
    try:
        conn = sqlite3.connect(MEMORY_DB_PATH)
        conn.execute("INSERT INTO decisions (timestamp, agenda, key_arguments, final_decision, rationale) VALUES (?, ?, ?, ?, ?)",
                     (ts, agenda, key_arguments, final_decision, rationale))
        conn.commit()
        conn.close()
        print("  [✅ Archivist] Decision DB への保存完了。")
    except Exception as e:
        print(f"  [📚 Archivist Database Error] 保存に失敗: {e}")

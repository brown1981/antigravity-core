import os
import sys
import sqlite3
import json
import logging
from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from pydantic import BaseModel
from dotenv import load_dotenv, set_key

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AI-CORP")

# Load existing environment
PROJECT_ROOT = "/Users/ooshirokazuki2/.gemini/antigravity/scratch"
ENV_PATH = os.path.join(PROJECT_ROOT, "ai_corp_v1", ".env")
load_dotenv(ENV_PATH)

# Add ai_corp_v1 to path
sys.path.append(os.path.join(PROJECT_ROOT, "ai_corp_v1"))

try:
    from agents import CEO, CTO, CFO, CMO, CDO, CLO, CSO, CKO, Specialist
    from company import BoardMeeting
    from memory.archivist import run_archivist_hook
except ImportError as e:
    logger.error(f"Failed to import ai_corp_v1 modules: {e}")

app = FastAPI(title="AI Corp. Management API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
QUANTS_DB = os.path.join(PROJECT_ROOT, "quant-backend", "specialist_v3_shadow.db")
RECORDS_DB = os.path.join(PROJECT_ROOT, "autonomous-company", "backend", "company_records.db")
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "autonomous-company", "frontend")

def init_db():
    conn = sqlite3.connect(RECORDS_DB)
    conn.execute('''CREATE TABLE IF NOT EXISTS meetings 
                    (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, agenda TEXT, reports_json TEXT, decision TEXT)''')
    conn.close()

init_db()

class MeetingRequest(BaseModel):
    agenda: str

class SettingsRequest(BaseModel):
    keys: dict

@app.get("/api/status")
def get_dashboard_status():
    """10名体制の役員ステータスとSub-AI情報を返す"""
    quant_stats = {"pf": "N/A", "expectancy": "N/A"}
    
    if os.path.exists(QUANTS_DB):
        try:
            conn = sqlite3.connect(QUANTS_DB)
            cursor = conn.cursor()
            cursor.execute("SELECT profit_factor, expectancy FROM performance_metrics ORDER BY timestamp DESC LIMIT 1")
            row = cursor.fetchone()
            if row:
                quant_stats = {"pf": round(row[0], 2), "expectancy": round(row[1], 4)}
            conn.close()
        except Exception as e:
            logger.error(f"Quant DB error: {e}")

    return {
        "timestamp": datetime.now().isoformat(),
        "president": {"name": "大城 和樹", "role": "Owner / Decision Maker"},
        "officers": [
            {"id": "CEO", "name": "Hermes", "status": "Active", "dept": "Management", "icon": "👑"},
            {"id": "CTO", "name": "Taro", "status": "Active", "dept": "Tech & Infrastructure", "icon": "⚙️"},
            {"id": "CFO", "name": "Kai", "status": "Active", "dept": "Treasury & Finance", "icon": "💰"},
            {"id": "CMO", "name": "Mira", "status": "Active", "dept": "Marketing & PR", "icon": "📢"},
            {"id": "CLO", "name": "Lex", "status": "Idle", "dept": "Legal & Audit", "icon": "⚖️", "sub_ai": ["Legal Researcher"]},
            {"id": "CSO", "name": "Stratos", "status": "Idle", "dept": "Strategy", "icon": "🔭"},
            {"id": "CKO", "name": "Lexi", "status": "Active", "dept": "Knowledge (RAG)", "icon": "📚"},
            {"id": "CDO", "name": "Sora", "status": "Idle", "dept": "Experience & Design", "icon": "🎨"},
            {"id": "Specialist", "name": "理系専務", "status": "Monitoring", "dept": "Quant Analysis", "icon": "🔬", "stats": quant_stats}
        ]
    }

@app.get("/api/meeting/history")
def get_meeting_history():
    conn = sqlite3.connect(RECORDS_DB)
    cursor = conn.cursor()
    cursor.execute("SELECT id, timestamp, agenda, reports_json, decision FROM meetings ORDER BY timestamp DESC")
    history = []
    for row in cursor.fetchall():
        history.append({
            "id": row[0],
            "timestamp": row[1],
            "agenda": row[2],
            "reports": json.loads(row[3]),
            "decision": row[4]
        })
    conn.close()
    return history

@app.post("/api/meeting/start")
async def start_meeting(req: MeetingRequest, background_tasks: BackgroundTasks):
    logger.info(f"Starting meeting for agenda: {req.agenda}")
    try:
        # Load keys before meeting
        load_dotenv(ENV_PATH, override=True)
        
        agents = [CEO(), CTO(), CFO(), CMO(), CDO(), CLO(), CSO(), CKO(), Specialist()]
        board = BoardMeeting("AI Corp. HQ", agents)
        
        reports = []
        final_decision = ""
        
        import time
        for officer, response in board.run(req.agenda, style="Universal Clean", stream=False):
            # サブAI稼働フラグの抽出
            sub_ai_active = False
            clean_response = response
            if "<!-- SUB_AI_ACTIVE -->" in response:
                sub_ai_active = True
                clean_response = response.replace("<!-- SUB_AI_ACTIVE -->", "").strip()

            if officer.role == "CEO":
                summary = f"議題: {req.agenda}\n\n報告内容:\n"
                for r in reports:
                    summary += f"【{r['role']}】{r['content']}\n\n"
                final_decision = officer.think(summary + "以上の内容から最終決定を下してください。")
            else:
                reports.append({
                    "role": officer.role,
                    "name": officer.name,
                    "content": clean_response,
                    "sub_ai_active": sub_ai_active
                })
            # レートリミット回避のためのウェイト
            time.sleep(2)
        
        ts = datetime.now().isoformat()
        conn = sqlite3.connect(RECORDS_DB)
        conn.execute("INSERT INTO meetings (timestamp, agenda, reports_json, decision) VALUES (?, ?, ?, ?)",
                     (ts, req.agenda, json.dumps(reports), final_decision))
        conn.commit()
        conn.close()
        
        # Corporate Memory の構造化・保存処理をバックグラウンドに流す
        background_tasks.add_task(run_archivist_hook, req.agenda, reports, final_decision)
        
        return {"agenda": req.agenda, "reports": reports, "decision": final_decision, "timestamp": ts}
    except Exception as e:
        logger.error(f"Meeting error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/settings")
def get_settings():
    """現在のAPIキー（隠蔽）と役員別のモデル設定を返す"""
    api_keys = ["OPENROUTER_API_KEY", "GEMINI_API_KEY", "GROQ_API_KEY", "SUPABASE_URL"]
    settings = {k: ("********" if os.getenv(k) else "") for k in api_keys}
    
    for k, v in os.environ.items():
        if k.startswith("ROLE_") and k.endswith("_MODEL"):
            settings[k] = v
            
    # 各役員のコード上のデフォルト値を取得
    from agents import CEO, CTO, CFO, CMO, CDO, CLO, CSO, CKO, Specialist
    agents_list = [CEO(), CTO(), CFO(), CMO(), CDO(), CLO(), CSO(), CKO(), Specialist()]
    defaults = {f"ROLE_{a.role}_MODEL": a.model_name for a in agents_list}
    
    return {"settings": settings, "defaults": defaults}

@app.post("/api/settings")
def update_settings(req: SettingsRequest):
    """APIキーを .env に保存する"""
    try:
        for k, v in req.keys.items():
            if k.startswith("ROLE_") and k.endswith("_MODEL"):
                # モデル設定は空文字でも保存（デフォルトへのリセットを許可）
                set_key(ENV_PATH, k, v)
                os.environ[k] = v
            elif v and "********" not in v:
                set_key(ENV_PATH, k, v)
                os.environ[k] = v
        load_dotenv(ENV_PATH, override=True)
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Settings update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Static files for UI
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)

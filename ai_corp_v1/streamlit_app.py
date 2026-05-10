import streamlit as st
import os
import time
from agents import CEO, CMO, CTO, CFO, CDO, CLO, CSO, CKO
from company import BoardMeeting
from dotenv import load_dotenv, set_key

# --- Config & Setup ---
load_dotenv()
ENV_PATH = ".env"

st.set_page_config(
    page_title="AI Boardroom OS - THE CORE",
    layout="wide",
    page_icon="🏢",
    initial_sidebar_state="expanded"
)

# --- [UI] Design System (Pure & Robust) ---
def inject_core_styles():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Inter:wght@400;500;700&display=swap');

    :root {
        --primary: #2563eb;
        --primary-soft: rgba(37, 99, 235, 0.08);
        --bg-main: #f8fafc;
        --text-main: #1e293b;
        --border-soft: #e2e8f0;
    }

    .stApp { background-color: var(--bg-main); color: var(--text-main); font-family: 'Inter', sans-serif; }
    h1, h2, h3 { font-family: 'Outfit', sans-serif !important; font-weight: 700 !important; }

    /* Sidebar - Navigation Aesthetics */
    [data-testid="stSidebar"] { background-color: white !important; border-right: 1px solid var(--border-soft); }
    
    /* Hide Radio Indicator Circle Safely (Protecting Text) */
    [data-testid="stSidebar"] .stRadio div[role="radiogroup"] label [data-testid="stMarkdownContainer"] {
        margin-left: -20px !important;
        white-space: nowrap !important;
    }
    [data-testid="stSidebar"] .stRadio div[role="radiogroup"] label div:first-child:not([data-testid="stMarkdownContainer"]) {
        display: none !important;
    }

    [data-testid="stSidebar"] .stRadio div[role="radiogroup"] label {
        padding: 8px 15px !important;
        border-radius: 10px !important;
        margin-bottom: 8px !important;
        color: #64748b !important;
        font-weight: 600 !important;
        transition: all 0.2s ease !important;
        min-width: 180px !important;
    }

    [data-testid="stSidebar"] .stRadio div[role="radiogroup"] label:has(input:checked) {
        background-color: var(--primary-soft) !important;
        color: var(--primary) !important;
        font-weight: 700 !important;
    }

    /* Terminal & Cards */
    .terminal-box {
        background: #020617; border-radius: 12px; padding: 25px; border: 1px solid #1e293b;
        color: #10b981; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem;
    }
    .premium-card {
        background: white; border: 1px solid var(--border-soft); border-radius: 16px;
        padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }

    #MainMenu, footer {visibility: hidden;}
    </style>
    """, unsafe_allow_html=True)

def render_svg_icon(name):
    icons = {
        "boardroom": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        "team": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        "library": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6 4 14"></path><path d="M12 6v14"></path><path d="M8 8v12"></path><path d="M4 4v16"></path></svg>',
        "settings": '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    }
    return f'<span style="display:inline-block; vertical-align:middle; margin-right: 12px; color: var(--primary);">{icons.get(name, "")}</span>'

# --- Auth ---
def check_auth():
    if "authenticated" not in st.session_state: st.session_state.authenticated = False
    if not st.session_state.authenticated:
        st.markdown('<div style="max-width: 400px; margin: 80px auto; text-align: center;">', unsafe_allow_html=True)
        st.markdown('<h1>AI CORP OS 🔒</h1><p style="color: #64748b;">Security Clearance Required</p>', unsafe_allow_html=True)
        login_pw = st.text_input("Enter Secret Key", type="password")
        if st.button("Authorize", use_container_width=True):
            if login_pw == os.getenv("APP_PASSWORD", "pepe"):
                st.session_state.authenticated = True; st.rerun()
            else: st.error("Access Denied")
        st.markdown('</div>', unsafe_allow_html=True)
        return False
    return True

# --- Main Logic ---
inject_core_styles()
if check_auth():
    # Session Persistence
    if "officer_models" not in st.session_state:
        st.session_state.officer_models = {k: "openrouter/anthropic/claude-3.5-sonnet" if k == "CEO" else "openrouter/google/gemini-2.0-flash-001" for k in ["CEO", "CMO", "CTO", "CFO", "CDO", "CLO", "CSO", "CKO"]}
    if "reports" not in st.session_state: st.session_state.reports = None
    if "ceo_decision" not in st.session_state: st.session_state.ceo_decision = None
    if "terminal_logs" not in st.session_state: st.session_state.terminal_logs = []

    def terminal_log(m):
        st.session_state.terminal_logs.append(f"[{time.strftime('%H:%M:%S')}] {m}")
        if len(st.session_state.terminal_logs) > 30: st.session_state.terminal_logs.pop(0)

    # --- Sidebar Nav ---
    with st.sidebar:
        st.markdown('<div style="text-align: center; margin-bottom: 2rem;">', unsafe_allow_html=True)
        st.markdown('<h2 style="font-size: 1.4rem; letter-spacing: 1px;">AI CORP OS</h2><p style="font-size: 0.6rem; color: #94a3b8; font-weight: 700;">TRUE CORE v3.0</p>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
        
        page = st.radio("Nav", ["BOARDROOM", "ORGANIZATION", "KNOWLEDGE", "SYSTEM"], label_visibility="collapsed")

    # --- Page Router ---
    if page == "BOARDROOM":
        st.markdown(f"<h2>{render_svg_icon('boardroom')} Executive Boardroom</h2>", unsafe_allow_html=True)
        agenda = st.text_area("📢 本日の議題（アジェンダ）", placeholder="議論の核心をここに入力してください...", height=100)
        
        col1, col2 = st.columns([5, 1])
        with col1: run_btn = st.button("🚀 会議を開始する", use_container_width=True, type="primary")
        with col2:
            is_mock = st.toggle("MOCK", value=(os.getenv("ANY_MODEL_MOCK") == "true"))
            if is_mock != (os.getenv("ANY_MODEL_MOCK") == "true"):
                set_key(ENV_PATH, "ANY_MODEL_MOCK", "true" if is_mock else "false"); os.environ["ANY_MODEL_MOCK"] = "true" if is_mock else "false"

        if run_btn and agenda:
            st.session_state.reports = {}; st.session_state.ceo_decision = None; st.session_state.terminal_logs = []
            role_map = {"CEO": CEO, "CMO": CMO, "CTO": CTO, "CFO": CFO, "CDO": CDO, "CLO": CLO, "CSO": CSO, "CKO": CKO}
            
            # --- SOLID Initialization (Clean) ---
            agents = [cls(model_override=st.session_state.officer_models.get(role)) for role, cls in role_map.items()]
            board = BoardMeeting("Antigravity Inc.", agents)
            
            terminal_log("SYSTEM: Board meeting initiated.")
            for off, res in board.run(agenda, stream=True):
                terminal_log(f"THOUGHT: {off.role} is analyzing...")
                if res == "CEO_TURN":
                    terminal_log("FINALIZING: CEO synthesis in progress...")
                    st.session_state.ceo_decision = "".join([c for c in off.think(f"以下の報告を全統合し、最終決断を下せ: {st.session_state.reports}", stream=True) if isinstance(c, str)])
                else:
                    st.session_state.reports[off.role] = res
            st.rerun()

        if st.session_state.reports:
            st.markdown("---")
            t1, t2 = st.tabs(["📄 REPORT", "💻 CONSOLE"])
            with t1:
                if st.session_state.ceo_decision:
                    st.markdown(f'<div style="background: #eff6ff; border: 2px solid var(--primary); padding: 30px; border-radius: 12px; margin-bottom: 2rem;"><p style="font-weight: 700; color: var(--primary);">CEO FINAL DECISION</p>{st.session_state.ceo_decision.replace("\n", "<br>")}</div>', unsafe_allow_html=True)
                for r, c in st.session_state.reports.items():
                    st.markdown(f'<div class="premium-card"><p style="font-weight: 700; opacity: 0.6;">{r} ANALYSIS</p>{c.replace("\n", "<br>")}</div>', unsafe_allow_html=True)
            with t2:
                st.markdown(f'<div class="terminal-box">{"<br>".join(st.session_state.terminal_logs)}<br>▌</div>', unsafe_allow_html=True)

    elif page == "ORGANIZATION":
        st.markdown(f"<h2>{render_svg_icon('team')} Officers & Intel</h2>", unsafe_allow_html=True)
        roles = [
            ("Hermes", "CEO", "👑", "戦略の舵取り。"), ("Mira", "CMO", "📢", "市場の探知器。"),
            ("Taro", "CTO", "⚙️", "技術の魔術師。"), ("Kai", "CFO", "💰", "財務の鉄壁。"),
            ("Sora", "CDO", "🎨", "感性のデザイナー。"), ("Lex", "CLO", "⚖️", "法の守護者。"),
            ("Stratos", "CSO", "🔭", "未来の預言者。"), ("Lexi", "CKO", "📚", "知識の司書。")
        ]
        model_opts = ["openrouter/anthropic/claude-3.5-sonnet", "openrouter/google/gemini-2.0-flash-001", "openrouter/google/gemini-2.0-pro-exp-02-05", "openrouter/deepseek/deepseek-chat"]
        
        cols = st.columns(2)
        for i, (n, r, e, b) in enumerate(roles):
            with cols[i % 2]:
                st.markdown(f'<div class="premium-card"><div style="display: flex; align-items: center; margin-bottom: 1rem;"><span style="font-size: 1.5rem; margin-right: 1rem;">{e}</span><div><p style="font-weight: 700; margin:0;">{n}</p><p style="font-size: 0.7rem; opacity: 0.6;">{r}</p></div></div><p style="font-size: 0.8rem; height: 3rem;">{b}</p>', unsafe_allow_html=True)
                new_m = st.selectbox(f"Model for {n}", model_opts, index=model_opts.index(st.session_state.officer_models[r]) if st.session_state.officer_models[r] in model_opts else 1, key=f"sel_{r}", label_visibility="collapsed")
                if new_m != st.session_state.officer_models[r]:
                    st.session_state.officer_models[r] = new_m; st.toast(f"{n} intel updated.")
                st.markdown('</div>', unsafe_allow_html=True)

    elif page == "KNOWLEDGE":
        st.markdown(f"<h2>{render_svg_icon('library')} Archive</h2>", unsafe_allow_html=True)
        st.markdown('<div class="premium-card"><h3>Obsidian Vault Synchronized</h3><p>全ての会議記録は Obsidian に永続保存されています。</p></div>', unsafe_allow_html=True)

    elif page == "SYSTEM":
        st.markdown(f"<h2>{render_svg_icon('settings')} Infrastructure</h2>", unsafe_allow_html=True)
        st.markdown('<div class="premium-card">', unsafe_allow_html=True)
        for k in ["OPENROUTER_API_KEY", "GROQ_API_KEY", "GEMINI_API_KEY"]:
            v = st.text_input(k.replace("_", " "), value=os.getenv(k, ""), type="password")
            if v != os.getenv(k, ""): set_key(ENV_PATH, k, v); os.environ[k] = v
        st.markdown('</div>', unsafe_allow_html=True)

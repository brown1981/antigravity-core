import os
import glob

def run_repo_analysis(directory_path: str) -> str:
    """プロジェクト全体の構造をスキャンし、重要なファイルを特定する。"""
    print(f"\n  [🛠️ Coding Agent] レポジトリ解析を開始: {directory_path}")
    
    analysis = ["■ [レポジトリ構成解析報告]"]
    
    try:
        # ディレクトリ構成の取得（最大3階層）
        files = []
        for root, dirs, filenames in os.walk(directory_path):
            level = root.replace(directory_path, '').count(os.sep)
            if level > 2: continue
            indent = "  " * level
            analysis.append(f"{indent}📁 {os.path.basename(root)}/")
            for f in filenames[:10]: # 1ディレクトリにつき10件まで
                if f.endswith(('.py', '.js', '.html', '.css', '.env', '.json')):
                    analysis.append(f"{indent}  📄 {f}")
    except Exception as e:
        analysis.append(f"解析エラー: {str(e)}")
        
    return "\n".join(analysis)

def read_source_code(file_path: str) -> str:
    """指定されたソースコードの内容を読み取る。"""
    try:
        if not os.path.exists(file_path):
            return f"エラー: ファイルが見つかりません ({file_path})"
        
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            return f"--- FILE: {file_path} ---\n{content}\n--- END ---"
    except Exception as e:
        return f"読み取りエラー: {str(e)}"

def coding_skill_wrapper(agenda: str) -> str:
    """CTO向けの総合コーディングスキル・エントリーポイント"""
    # プロジェクトルートの推定
    project_root = "/Users/ooshirokazuki2/.gemini/antigravity/scratch"
    
    # 技術的なキーワードが含まれているかチェック
    tech_keywords = ["コード", "実装", "バグ", "修正", "開発", "設計", "アーキテクチャ", "パフォーマンス", "CSS", "UI", "DB", "API"]
    if not any(k in agenda for k in tech_keywords):
        return ""

    print(f"  [💻 Coding Agent] 技術的な議題を検知：実地調査を行います...")
    
    # 1. 全体構成の把握
    repo_structure = run_repo_analysis(project_root)
    
    # 2. 議題に関連しそうなファイルを探す
    # (簡易的にキーワードマッチで重要なファイルを特定)
    hints = []
    if "UI" in agenda or "CSS" in agenda or "画面" in agenda:
        hints.append(read_source_code(os.path.join(project_root, "autonomous-company", "frontend", "index.html"))[:1000])
    if "API" in agenda or "バックエンド" in agenda:
        hints.append(read_source_code(os.path.join(project_root, "autonomous-company", "backend", "main.py"))[:1000])
    if "役員" in agenda or "AI" in agenda:
        hints.append(read_source_code(os.path.join(project_root, "ai_corp_v1", "agents.py"))[:1000])

    context = f"\n{repo_structure}\n"
    if hints:
        context += "\n■ [関連コードスピンオフ]\n" + "\n".join(hints)
        
    return context

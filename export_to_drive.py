import os
import json
import datetime

LAKE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data_lake', 'raw_data')
EXPORT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data_lake', 'exports')

def dict_to_markdown(data, indent=0):
    """
    JSONデータ（辞書やリスト）を再帰的に解析し、
    クリーンで読みやすいMarkdownの箇条書きに変換します。
    """
    md = ""
    prefix = "  " * indent
    
    if isinstance(data, dict):
        for k, v in data.items():
            # キー名を人間に読みやすく整形 (例: "fear_and_greed" -> "Fear And Greed")
            clean_key = str(k).replace('_', ' ').title()
            
            if isinstance(v, (dict, list)):
                if not v: # 空のリストや辞書の場合
                    md += f"{prefix}- **{clean_key}**: なし\n"
                else:
                    md += f"{prefix}- **{clean_key}**:\n"
                    md += dict_to_markdown(v, indent + 1)
            else:
                md += f"{prefix}- **{clean_key}**: {v}\n"
                
    elif isinstance(data, list):
        for item in data:
            if isinstance(item, (dict, list)):
                md += dict_to_markdown(item, indent + 1)
            else:
                md += f"{prefix}- {item}\n"
    return md

def export_for_notebooklm():
    """
    データレイクの生データを読みやすいMarkdownに変換し、月次アーカイブに追記します。
    """
    now = datetime.datetime.now()
    month_str = now.strftime("%Y_%m")
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
    
    export_file = os.path.join(EXPORT_DIR, f"Archive_{month_str}.md")
    
    print(f"📦 [DATA EXPORT] Formatting and appending to monthly archive ({export_file})...")
    
    content = f"\n\n# --- 🧠 Daily Intelligence Dump: {timestamp} ---\n\n"
    
    # 順番を揃えるためにファイルリストをソート
    files = sorted([f for f in os.listdir(LAKE_DIR) if f.endswith('.json')])
    
    for filename in files:
        app_id = filename.replace('.json', '')
        file_path = os.path.join(LAKE_DIR, filename)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                payload = json.load(f)
                
            content += f"## 📡 Source App: {app_id.upper()}\n"
            content += f"> **Last Updated:** {payload.get('timestamp')}\n\n"
            
            # JSONブロックではなく、人間とNotebookLMが読みやすいMarkdown階層に変換
            content += dict_to_markdown(payload.get('data', {}))
            content += "\n---\n\n"
            
        except Exception as e:
            print(f"Error reading {filename}: {e}")
            
    try:
        with open(export_file, 'a', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Markdown Append successful: {export_file}")
    except Exception as e:
        print(f"❌ Append Failed: {e}")

import time

def start_background_loop(interval=3600):
    """
    Webサーバー（app.py）のバックグラウンドスレッドから呼び出される無限ループ
    デフォルトでは1時間に1回エクスポートを実行します
    """
    while True:
        export_for_notebooklm()
        time.sleep(interval)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--one-shot', action='store_true')
    args = parser.parse_args()

    if args.one_shot:
        export_for_notebooklm()
    else:
        start_background_loop()


import os
import glob
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

def process_and_cache():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        print("エラー: .env に有効な GEMINI_API_KEY が設定されていません。")
        return

    client = genai.Client(api_key=api_key)
    knowledge_dir = "legal_knowledge"
    
    if not os.path.exists(knowledge_dir):
        os.makedirs(knowledge_dir)
        
    files = glob.glob(os.path.join(knowledge_dir, "*.pdf")) + glob.glob(os.path.join(knowledge_dir, "*.txt"))
    if not files:
        print(f"ドキュメントが見つかりません。{knowledge_dir}/ フォルダに PDF または TXT データを配置してください。")
        return

    print(f"{len(files)} 件のファイルを検出しました。Gemini にアップロードを開始します...")
    uploaded_files = []
    for file_path in files:
        print(f"アップロード中: {file_path} ...")
        uploaded_file = client.files.upload(file=file_path)
        uploaded_files.append(uploaded_file)
    
    print("\nコンテキストキャッシュを作成しています...")
    print("（※注意: キャッシュ生成には総ドキュメント量が 32,768 トークン以上である必要があります）")
    
    try:
        cached_content = client.caches.create(
            model='gemini-2.5-pro',
            config=types.CreateCachedContentConfig(
                contents=uploaded_files,
                display_name='clo_legal_knowledge',
                ttl='86400s', # 24時間保持 (運用コストに応じて調整)
            ),
        )
        
        # キャッシュ名を保存
        with open('.clo_cache_name', 'w') as f:
            f.write(cached_content.name)
            
        print(f"\n✅ 成功！キャッシュが生成されました: {cached_content.name}")
        print("次回の役員会議より、CLO(Lex) は自動的にこの法務データベースに基づき回答します。")
    except Exception as e:
        print(f"\n❌ キャッシュ構築エラー。")
        print(f"エラー詳細: {e}")
        print("ヒント: キャッシュには約3万字〜5万字規模以上の大きなルールブックや法務ドキュメントが必要です。")

if __name__ == "__main__":
    process_and_cache()

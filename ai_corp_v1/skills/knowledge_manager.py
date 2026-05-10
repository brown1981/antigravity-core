import os
import json
import google.generativeai as genai
from supabase import create_client, Client
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class KnowledgeManager:
    """
    最高知識責任者（CKO）の実務スキル。
    知識のベクトル化、Supabaseへの蓄積、および検索を担当する。
    """
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        
        if not all([self.supabase_url, self.supabase_key, self.gemini_key]):
            print("⚠️ SupabaseまたはGeminiの環境変数が設定されていません。")
            return

        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        genai.configure(api_key=self.gemini_key)

    def generate_embedding(self, text: str) -> List[float]:
        """テキストを意味の座標（ベクトル）に変換する"""
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']

    def store_knowledge(self, content: str, source: str, role: str = "Common"):
        """知識を構造化してSupabaseに保存する（CKOの記録作業）"""
        embedding = self.generate_embedding(content)
        
        data = {
            "content": content,
            "metadata": {
                "source": source,
                "role": role,
                "timestamp": "now()"
            },
            "embedding": embedding
        }
        
        try:
            res = self.supabase.table("knowledge").insert(data).execute()
            print(f"✅ 知識を記録しました: {source}")
            return res
        except Exception as e:
            print(f"❌ 保存エラー: {e}")
            return None

    def search_relevant_knowledge(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """現在の議論に関連する過去の知識を引き出す（CKOの司書作業）"""
        query_embedding = genai.embed_content(
            model="models/text-embedding-004",
            content=query,
            task_type="retrieval_query"
        )['embedding']

        # Supabase の RPC (Remote Procedure Call) を使用して近傍探索
        # 注意: 予め Supabase 側で match_knowledge 関数を定義しておく必要があります
        try:
            res = self.supabase.rpc(
                "match_knowledge", 
                {
                    "query_embedding": query_embedding,
                    "match_threshold": 0.5,
                    "match_count": limit
                }
            ).execute()
            return res.data
        except Exception as e:
            print(f"❌ 検索エラー: {e} (match_knowledge関数が定義されていない可能性があります)")
            return []

if __name__ == "__main__":
    # テスト用実行コード
    manager = KnowledgeManager()
    # manager.store_knowledge("弊社の2024年戦略はデジタル・ファーストです。", "Internal Policy")
    # results = manager.search_relevant_knowledge("デジタル戦略について教えて")
    # print(results)

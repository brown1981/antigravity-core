import os
import datetime
from dotenv import load_dotenv
from litellm import completion
from duckduckgo_search import DDGS

load_dotenv()

def run_market_research(agenda: str) -> str:
    """CMO（Mira）の実働部隊。市場トレンドや競合他社の情報を収集する。"""
    print("\n  [🔭 CMO 実働部隊] 市場調査を開始...")

    # クエリ生成
    search_query = "AI 市場 トレンド 競合"
    if os.getenv("ANY_MODEL_MOCK") == "true":
        search_query = "AI SaaS 最新トレンド"
    else:
        try:
            # 調査用クエリの洗練を Gemini Flash に依頼
            model = os.getenv("ROLE_CMO_MODEL", "google/gemini-2.0-flash")
            res = completion(
                model=model,
                messages=[{"role": "user", "content": f"以下の議題から、市場調査に最適な検索キーワードを2〜3語で抽出して出力のみ回答：\n{agenda}"}],
                max_tokens=20, 
                temperature=0.1
            )
            search_query = res.choices[0].message.content.strip().replace("\"", "")
        except Exception:
            pass

    print(f"  [🎯 検索クエリ]: '{search_query}'")

    report_lines = [f"\n◆【市場リサーチ部隊からの報告】(クエリ: {search_query})"]
    
    try:
        with DDGS() as ddgs:
            # 最新トレンド検索
            results = list(ddgs.text(f"{search_query} 2024 OR 2025 トレンド 比較", max_results=5))
            
            if results:
                report_lines.append("\n[最新の市場動向・ニュース]")
                for r in results:
                    report_lines.append(f"- {r.get('title')}: {r.get('body', '')[:150]}...")
            else:
                report_lines.append("- Web上に関連する最新情報は見つかりませんでした。")

    except Exception as e:
        report_lines.append(f"\n[検索エラー]: {str(e)}")

    final_report = "\n".join(report_lines)

    # ログ保存
    os.makedirs("records/raw_cmo_research", exist_ok=True)
    filename = f"records/raw_cmo_research/{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_market_raw.txt"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(final_report)

    print(f"  [✅ CMO 実働部隊] 調査完了。")
    return final_report

if __name__ == "__main__":
    print(run_market_research("次世代AIポータルの競合分析"))

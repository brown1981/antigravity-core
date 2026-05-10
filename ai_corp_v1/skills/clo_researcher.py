import os
import datetime
from dotenv import load_dotenv
from litellm import completion
from duckduckgo_search import DDGS

load_dotenv()

def run_legal_research(agenda: str) -> str:
    """CLO（Lex）の実働部隊。議題に関連する法的情報を収集する。"""
    print("\n  [🔍 CLO 実働部隊] 法務調査を開始...")

    is_global = any(k in agenda for k in ["EU", "海外", "グローバル", "越境", "アメリカ", "欧州", "外国", "データ", "SaaS", "クラウド"])

    # クエリ生成
    search_query = "AI データ 規制"
    if os.getenv("ANY_MODEL_MOCK") == "true":
        search_query = "AI 著作権 ガイドライン"
    else:
        try:
            model = os.getenv("ROLE_CMO_MODEL", "groq/llama-3.1-8b-instant")
            res = completion(
                model=model,
                messages=[{"role": "user", "content": f"以下の議題から法務調査用の検索キーワードを2〜3語で抽出。キーワードのみ回答：\n{agenda}"}],
                max_tokens=20, temperature=0.1
            )
            search_query = res.choices[0].message.content.strip().replace("\"", "")
        except Exception:
            pass

    search_query_full = f"{search_query} {agenda[:15]}"
    print(f"  [🎯 検索クエリ]: '{search_query_full}' (グローバル: {is_global})")

    report_lines = [f"\n◆【法務実働部隊からの報告】(クエリ: {search_query})"]
    if is_global:
        report_lines.append("🚨 【グローバル案件】: GDPR/CCPA等の国際法規を優先します。")

    try:
        with DDGS() as ddgs:
            # Authority検索
            base_auth = "site:ppc.go.jp OR site:caa.go.jp OR site:meti.go.jp"
            if is_global:
                base_auth += " OR site:edpb.europa.eu OR site:ico.org.uk"
            auth_results = list(ddgs.text(f"{search_query_full} ({base_auth})", max_results=3))
            report_lines.append("\n[規制当局の見解]")
            if auth_results:
                for r in auth_results:
                    report_lines.append(f"- {r.get('title')}: {r.get('body', '')[:120]}")
            else:
                report_lines.append("- 政府機関の明示的なガイドラインは見つかりませんでした。")

            # News検索
            news_results = list(ddgs.news(f"{search_query_full} 違反 OR 訴訟 OR 罰則", max_results=2))
            report_lines.append("\n[関連ニュース・訴訟事例]")
            if news_results:
                for r in news_results:
                    report_lines.append(f"- {r.get('title')}: {r.get('body', '')[:120]}")
            else:
                report_lines.append("- 直近の目立ったインシデントはありません。")

    except Exception as e:
        report_lines.append(f"\n[検索エラー]: {str(e)}")

    final_report = "\n".join(report_lines)

    # ログ保存
    os.makedirs("records/raw_clo_research", exist_ok=True)
    filename = f"records/raw_clo_research/{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_clo_raw.txt"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(final_report)

    print(f"  [✅ CLO 実働部隊] 調査完了。")
    return final_report


if __name__ == "__main__":
    print(run_legal_research("AIの著作権ガイドラインに関する調査"))

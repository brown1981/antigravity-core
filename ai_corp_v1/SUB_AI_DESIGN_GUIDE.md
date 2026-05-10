# 実働部隊（Sub-AI / Operational Staff）設計ガイドライン

本番運用における「自律型AI役員会」が正確で価値ある判断を下すための、実働部隊サブAI（`skills/*.py`）の設計・開発マニュアルです。「アジェンダに対して役員LLMが答えるまで」の中間処理（データETL）を司ります。

---

## 1. 【核心】実働部隊と役員の役割分担（境界線）

実働部隊の設計において**最も重要なのが「役割の分離」**です。実働部隊は「データ抽出（一次情報の確保）」のみを行い、「意味づけや判断」は絶対にさせてはいけません。ここを破るとシステムが崩壊します。

*   **実働部隊（パラリーガル / リサーチスタッフ）の役割**
    *   外部からデータを取ってくる（DDG検索、スクレイピング、API）。
    *   事実と条文をそのまままとめる（URL、日付、タイトル、抜粋テキスト）。
    *   ❌ 判断しない（「このリスクは深刻です」「やめたほうがいいです」とは絶対に書かない）。
*   **AI役員（The Decision Maker）の役割**
    *   【実働部隊の生データ】を読み込む。
    *   自身の厳しい役割定義（`プロンプト`）に基づいて、リスクを構造化し、経営層や他役員に警告・進言する。

---

## 2. 実践：検索精度を極限まで高める「プロのハック」

実働部隊の品質（ノイズの排除と純度向上）は役員の意思決定の質に直結します。以下のテクニックを原則として適用してください。

*   **A. クエリのハイブリッド化（2層クエリ）**
    *   LLMが抽出した「2〜3個の洗練された単語」単体で検索すると、元の文脈（何のアプリについての話か等）が欠落します。
    *   必ず `f"{llm_keywords} {agenda[:15]}"` のように、元の文脈の一部を結合させて検索エンジンに投げます。
*   **B. ドメインの完全限定（SEOノイズの排除）**
    *   検索クエリに「弁護士」や「法律」と単に入れると、質の低いSEOブログやまとめサイトがヒットします。
    *   情報は必ず `site:ppc.go.jp` (個人情報保護委) や `site:caa.go.jp` (消費者庁) など、**管轄する公式機関のドメインに完全限定**して取得します。
*   **C. Wikipediaからの脱却と「条文・一次データ」の直接参照**
    *   専門役員へのインプットにWikipediaは不要です。
    *   法令を引く場合は、必ず `site:elaws.e-gov.go.jp` (e-Gov法令検索) 等に限定し、「実際の条文」を抽出してください。
*   **D. グローバル案件時の「国際権威」動的追加**
    *   「EU」「データ」「SaaS」「越境」などのフラグが立った場合、日本の省庁だけでなく、`site:edpb.europa.eu` (欧州データ保護会議) や `site:ico.org.uk` (英国情報コミッショナーオフィス) といった**世界トップの関連権威機関**を検索先に強制追加します。

---

## 3. 実働スクリプト（Python）の実装テンプレート

```python
import os
import datetime
from litellm import completion
from duckduckgo_search import DDGS

def run_research(agenda: str) -> str:
    # 1. 簡易LLMによるキーワード抽出 + アジェンダ紐付け（2層クエリ）
    llm_keywords = "AI 著作権 データ" # 実際はLiteLLMで抽出
    search_query = f"{llm_keywords} {agenda[:15]}"
    
    report_lines = []
    with DDGS() as ddgs:
        # 2. 完全な一次情報（政府機関）へのドメイン限定検索
        gov_domain = "site:meti.go.jp OR site:caa.go.jp"
        results = list(ddgs.text(f"{search_query} ({gov_domain})", max_results=2))
        
        for r in results:
             report_lines.append(f"- 【権威情報】{r['title']}\n  URL: {r['href']}")

    final_report = "\n".join(report_lines)
    
    # 3. 生データのログ保存（将来のBIGデータ・自社ナレッジ用）
    os.makedirs("records/raw_staff", exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    with open(f"records/raw_staff/{timestamp}_raw.txt", "w") as f:
        f.write(final_report)
        
    return final_report
```

---

## 4. 今後の応用（他の役員用サブAI展開アイデア）

*   **CMO用部隊（市場・競合リサーチャー）**
    *   検索指示: `site:prtimes.jp OR site:nikkei.com`で競合他社の最新プレスリリースに限定したファクト収集。
*   **CDO用部隊（UI/UXトレンダー）**
    *   検索指示: Web検索ではなく、UI事例サイト（Awwwards等）やDribbbleなどのトレンドデータ取得。
*   **CFO用部隊（ファイナンスAPI）**
    *   検索指示: 検索ではなく、`yfinance` ライブラリ等で具体的な株価、為替レート、金利データを正確に取得する。

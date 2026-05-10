# AI株式会社 OS: BLUEPRINT v2 (Active Execution)

> [!NOTE]
> このブループリントは「AI株式会社」の成長と自律性を支えるための動的設計図です。Obsidianによる永続ナレッジと、自律メンテナンス・プロトコル、そしてウェブデプロイを通じた「真のOS」への進化を定義します。

---

## 1. コア・アーキテクチャ (v2.1)

### 1-1. 知能の分散 (Model Sharding)
各役員の役割（責任範囲）に応じて、最適化された LLM モデルを割り当てる。
- **CEO (Hermes)**: `claude-3-5-sonnet-20241022` (戦略・判断の最高峰)
- **CKO (Lexi) & CTO (Taro)**: `gemini-1.5-pro` (長大な知識・コードのコンテキスト処理)
- **CMO (Mira) & CLO (Lex)**: `gemini-1.5-flash / groq-llama-3.1` (高速なリサーチ・検索・要約)

### 1-2. 永続的な記憶 (Longevity Engine)
- **Primary**: `EXPERIENCE_LOG.md` (AIの全行動における教訓と反省の蓄積)
- **Secondary**: `obsidian_vault/` (人間が閲覧・整理するための構造化ナレッジグラフ)
- **Archive**: 月次自動サマリーとアーカイブ化による、データ肥大化の防止。

---

## 2. 実働部隊 (Sub-AI Agents)

各役員は、直接考えを述べるだけでなく、外部ツールを駆使する部隊（Skill）を持つ。
- **CLO Researcher**: `duckduckgo-search` と法的サイトフィルタリングによる調査。
- **CMO Market-Analyst**: [NEW] 市場トレンド、競合ニュースのリアルタイム収集。
- **CTO Architect**: ローカルレポジトリの静的解析とコード生成。

---

## 3. ナレッジ・アーカイビスト (Knowledge Archivist)

会議（Boardroom）が終了するたびに、以下のフローを自動実行する。
1.  **要約**: 議論の結果とCEOの最終決断を抽出。
2.  **Obsidian出力**: 適切なメタデータ（日付、参加者、タグ）を付与したMarkdownとして `obsidian_vault/meetings/` に保存。
3.  **関連付け**: 議事録間のリンクを自動生成し、知識をネットワーク化する。

---

## 4. デプロイ・運用戦略

### 4-1. 外部公開プロトコル
- **Cloudflare Tunnel (Plan B)**: President の Mac 上で稼働させつつ、セキュアなトンネルを通じて外部公開する。
- **メリット**: ローカルの `obsidian_vault` に直接アクセスし続けられる唯一の方法。

### 4-2. セキュリティと認証
- **Simple Auth**: 外部公開時はパスワード保護を有効化。
- **Secret Management**: APIキーは環境変数で管理し、ソースには露出させない。

---

## 現在の進捗状況
- [x] アーキテクチャの定義 (Blueprint v2)
- [x] 憲法の制定と教訓ログの創設 (GLOBAL_RULES / EXPERIENCE_LOG)
- [x] 自律メンテナンス・プロトコルの実装 (Auto-Archive)
- [ ] ナレッジ・アーカイビストの実装
- [ ] 最小限のリサーチ部隊 (CMO) の完成
- [ ] 外部公開 (Web Deploy) の完了

---
> [!IMPORTANT]
> 「AI株式会社」は President と AI との対等かつ永続的なパートナーシップの場です。このシステムは、President が寝ている間も自律的に思考し、起きた時に Obsidian を開けば成果が並んでいる状態を目指します。

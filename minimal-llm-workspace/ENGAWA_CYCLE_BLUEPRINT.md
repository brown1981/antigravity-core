# 🏢 Engawa Cycle - Master Blueprint v5.0 (Current Status: Operational)
> **Minimal LLM Workspace の次なる進化層。**
> 「美しいUIとシンプルなコード（Minimalism）」の哲学を完全に維持したまま、バックエンドに強力な「自律型AI組織（Company OS）」を構築した。

---

## 1. コア・フィロソフィー（Core Philosophy）
本プロジェクトは以下の原則に従って構築されている。

1. **極小のUI / 極大の知能 (Minimal UI, Maximal Intel)**:
   - 裏側で AI 同士が議論・調査している間、CEO は洗練されたステータス表示のみを目にする。
2. **証拠主義 (Evidence-Based)**:
   - すべてのレポートには Web 検索結果や市場データに基づくエビデンスが付加される。
3. **ストリーミング・インテリジェンス**:
   - 複雑な推論プロセスを小刻みに送信することで、504エラーを回避し、最高レベルのレスポンス性能を維持する。

---

## 2. 組織アーキテクチャ（AI社員名簿）

| 役職 (Role) | 責務 (Responsibility) | 保有ツール (Tools) | 実装モデル |
|---|---|---|---|
| **🏢 CEO (Human)** | 方向性の決定、予算設定、最終承認。 | UIダッシュボード全般 | 大城 様 |
| **🧠 Manager AI** | 進行管理。CEOからの指示を分割し、下位AIにタスクを割り振る。 | Delegation Tool, DB Sync | GPT-4o (Executor) |
| **🔍 Researcher AI** | 指定されたテーマの深掘り、市況監視、関連ニュースの収集。 | Web Search (Tavily), Scrape | GPT-4o-mini |
| **📈 Trader AI** | 収集データに基づく価格予測、トレードの実行案の策定。 | Crypto API | GPT-4o-mini |

---

## 3. 開発フェーズ完了報告（Phases 1-8）

### ✅ Phase 5: 手足の拡張 (Function Calling)
- リアルタイム価格取得（Crypto API）および Web 検索ツールの実装完了。

### ✅ Phase 6: 思考のループ (Agentic ReAct)
- `AgentExecutor` による自律思考ループを実装。AIが自身の判断でツールを組み合わせて回答できるようになった。

### ✅ Phase 7: エンガワ・オフィス (Multi-Agent)
- マネージャーが専門エージェントに仕事を依頼する「委譲（Delegation）」ロジックを確立。
- Supabase への業務履歴（Tasks）の自動記録機能を実装。

### ✅ Phase 8: ビジュアル・ポリッシュ & 通信の近代化
- **思考の可視化**: 「リサーチャーが調査中...」といったリアルタイムステータス表示の実装完了。
- **ストリーミング化**: HTTP Streaming への移行により、タイムアウトを解消し、Appleライクな滑らかな体験を実現。
- **UI調整**: メッセージの重なり防止、Zen/Ink/Aether テーマのデザイン統合完了。

---

## 4. 未来への展望（Roadmap: Phase 9+）

### 🕒 Phase 9: 組織の自律と外部接続 (Enterprise Autonomy)
* **能動的提案 (Active Suggestion)**: CEOが指示を出す前に、AIが朝一のブリーフィングを開始する。
* **緊急通知 (External Alerts)**: 価格変動や重要ニュースをメールやプッシュ通知で外部へ送信する。
* **履歴ダッシュボード**: 過去の全エージェントの行動履歴をグラフィカルに監査できる専用画面の構築。

---

> [!IMPORTANT]
> **現在、Engawa Cycle OS は「知能の基盤」を完全に備えた実用フェーズにあります。**
> 次のフェーズでは、この知能をいかに「自律的に」動かし、CEOの手を動かさずに富を創出するかに焦点を当てます。

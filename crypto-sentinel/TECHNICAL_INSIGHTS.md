# 🔍 Crypto Sentinel - Technical Insights & Audit (Antigravity Perspective)

このドキュメントは、現在のエンジニア（AI エージェント）の視点による、技術的な舞台裏と「次の方」へのアドバイスです。

## ⚠️ 開発の「落とし穴」と解決策 (Technical Traps)

### 1. Cloudflare Workers の非同期実行制限
- **課題**: `npx wrangler deploy` (OpenNext経由) でデプロイした際、バックエンドでの DB 保存が頻繁に失敗した。
- **原因**: Cloudflare Worker はレスポンスを返した瞬間に、未完了の `Promise` (非同期処理) を強制終了する性質がある。
- **解決**: `/api/analyze/route.ts` 内の `supabase.from(...).insert()` を `.then()` ではなく `await` で実行し、保存完了を確認してからレスポンスを返すように修正。これにより保存が 100% 成功するようになった。

### 2. Next.js 16 (Turbopack) ＆ Edge Functions の型競合
- **課題**: `supabase/functions/` (Edge Functions) 内に Deno 向けコード (`jsr:`) があると、`next build` が失敗した。
- **原因**: Next.js の TypeScript コンパイラが、Node.js 環境にない Deno 固有の構文を解釈しようとした。
- **解決**: `tsconfig.json` の `exclude` に `supabase` フォルダを追加。これにより開発効率を落とさずにデプロイを可能にした。

### 3. Recharts のレスポンシブ崩れ
- **課題**: `ResponsiveContainer` が、親の `flex` や `grid` レイアウト下で高さ 0 と判定され、表示されないことがあった。
- **解決**: `HistoryChart.tsx` の親要素に `min-h-[192px]` 等の明示的な高さを指定し、描画を安定化。

---

## 🏗️ 技術的負債 ＆ リファクタリング候補 (Technical Debt)

1. **API の 1分制限 (Refresh Interval)**: 
   - 現在ブラウザ側で 1分ごとに `fetch` しているが、Binance API のレート制限や Cloudflare の計算コストを考慮し、サーバーサイドでのキャッシュ戦略をより強化できる余地がある。
2. **Signal スコアの計算ロジックのハードコード**: 
   - `lib/analysis.ts` に指標の重み（RSI に 40点、MACD に 30点など）が直接書かれている。将来的に AI にこの重みを調整させるための「メタ・パラメータ管理」が必要。
3. **エラーハンドリングの共通化**: 
   - Supabase 接続エラーなどが各 API やコンポーネントに散らばっている。共通のエラーバウンダリとロギングシステムの導入を推奨。

---

## 🧠 次の戦略的ステップ（AI への提言）

### フェーズ 3.5: pgvector による「記憶」の実装
- `analysis_results` を単なる履歴ではなく、「ベクトル」として保存することで、「今のチャートの形は、過去のどの瞬間と似ているか？」を瞬時に検索できるようにする。
- **AI の役割**: その類似した瞬間の「その後の価格変動」を分析し、より精度の高い勝率予測を提供。

### フェーズ 4: 「自律」への道
- `alert-monitor` (Edge Function) を「アラートを送るだけ」から「LLM が判断して API 注文を出す」司令塔へ進化させる。
- **リスク管理**: 注文前に「人間の目（ダッシュボード上）」で最終承認を求めるフローが必要。

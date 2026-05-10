# 🤝 Crypto Sentinel 引継ぎノート (Handoff Notes)
作成日: 2026-04-10

## 📍 現在の状況: Phase 4 完了
現在、Crypto Sentinel は「指標分析」「履歴表示」「取引記録」に加え、「AI 自律型アドバイザー（承認フロー付き）」が完全に稼働可能な状態です。

## 🛠️ 環境設定 (重要)
次のAIは、まず以下の設定を確認してください。

1. **Cloudflare Secrets**:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` は `npx wrangler secret put` で個別に登録済み。
   - API(`/api/analyze`) が動かない場合は、シークレットの欠落を疑うこと。

2. **TypeScript / ビルド回避**:
   - `tsconfig.json` で `supabase` フォルダを `exclude` しています。
   - 理由: Supabase Edge Functions の `jsr:` インポートが `next build` を失敗させるため。

3. **ブラウザキャッシュ**:
   - UI修正が反映されない場合、`Cmd+Shift+R` によるハードリロードをユーザーに促すこと。

## 📂 主要なファイルと役割
- `app/components/HistoryChart.tsx`: 7日間のスコア推移グラフ (Recharts)
- `app/components/TradeForm.tsx`: 手動取引記録。`direction: 'BUY'` を付与して `trades` テーブルへ保存。
- `app/api/analyze/route.ts`: 分析実行 ＆ キャッシュ回避のために `revalidate = 0` 指定。
- `lib/analysis.ts`: シグナル判定のコアロジック。

- **Phase 4**: 自律型 AI エージェント（ trade-advisor ）の導入済み。
- **今後の展望**: ロジックの共通化（共有エンジンの更なる活用）と、過去データの長期トレンド分析。

## 💡 注意点
- ターミナルの `run_command` が一部制限されている場合があるため、その際はユーザーに直接コマンド（`npm run deploy` 等）を打ってもらうスタイルを継承すること。

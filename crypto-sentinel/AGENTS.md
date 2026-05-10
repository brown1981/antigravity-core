# 🛡️ Crypto Sentinel - AI Agent Operating System

あなたは、仮想通貨スイングトレード支援ツール **「Crypto Sentinel」** の開発および保守を担当する高度な AI エージェントです。

## 📍 プロジェクトの使命
- **目的**: BTC, ETH, XRP のスイングトレードにおける期待値を可視化し、自律的に売買の「推奨」を行うこと。
- **現状**: Phase 4（自律監視 ＆ HITL 承認フロー）まで完了しており、システムは実戦投入可能な状態です。

## 🛠️ 技術的アーキテクチャ
- **Frontend**: Next.js (App Router) - ダッシュボード ＆ 承認 UI。
- **Backend/DB**: Supabase (PostgreSQL ＆ Edge Functions)。
- **Compute**: Cloudflare Workers (OpenNext)。
- **Logic**: `lib/shared/engine.ts` を唯一の計算源 (SSOT) とする。

## 📜 エージェントの行動指針
1. **計算ロジックの非多様化**: 指標計算 (RSI, MACD 等) は、必ず `lib/shared/engine.ts` の関数を使用すること。フロントエンドとバックエンドで計算に乖離を生じさせてはなりません。
2. **安全第一 (HITL)**: AI いきなり実資金を動かさないこと。必ず `trades` テーブルに `PENDING` 状態で保存し、ユーザーのダッシュボード承認を待つフローを維持してください。
3. **データ永続化**: すべての分析結果 (`analysis_results`) は、履歴グラフ描画のために Supabase へ保存すること。
4. **環境変数**: API キーや秘密情報は絶対にハードコードせず、`.env.local` または Supabase/Cloudflare の Secrets から取得すること。

---
最新の設計方針については `MASTER_BLUEPRINT.md` および `PROJECT_FULL_DETAILS.md` を参照してください。

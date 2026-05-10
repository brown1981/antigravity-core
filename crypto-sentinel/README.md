# 🛡️ Crypto Sentinel (v1.0)

Crypto Sentinel は、仮想通貨（BTC, ETH, XRP）のスイングトレードを支援する自律型ダッシュボードです。テクニカル分析による自動スコアリングと、AI エージェントによる投資判断、そして人間による最終承認（Human-in-the-Loop）を組み合わせた高度な運用プラットフォームです。

## 🌟 主な機能
- **リアルタイム分析**: RSI, MACD, ボリンジャーバンドを用いた精密なテクニカルスコアリング (-100 〜 +100)。
- **AI 自律アドバイザー**: Supabase Edge Function (`trade-advisor`) が 1時間ごとに市場を監視し、期待値が高い局面で AI (GPT-4o) に相談します。
- **HITL 承認フロー**: AI の提案はダッシュボードでひと目で確認でき、「承認」ボタンを押すまで資金は動きません。
- **履歴チャート**: 過去 7 日間のシグナルスコア推移を Recharts で可視化。
- **レスポンシブ UI**: ダークモードで見やすく、モバイルでの確認も容易です。

## 🛠️ 技術構成
- **Frontend**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Infrastructure**: Cloudflare Workers (OpenNext)
- **Edge Functions**: Supabase Edge Functions (Deno / TypeScript)

## 🚀 セットアップ ＆ デプロイ

### 1. 環境変数の設定
`.env.local` に以下のキーを設定してください（または各プラットフォームの Secrets へ登録）。
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (自動実行用)
- `AI_API_KEY` (OpenAI の API キー)

### 2. ローカル実行
```bash
npm install
npm run dev
```

### 3. デプロイ
- **Web App**: `npm run deploy` (Cloudflare Workers)
- **Edge Function**: `npx supabase functions deploy trade-advisor`

---

## 📈 運用戦略
本プロジェクトは、元手 40 万円に対して月利 2.5%（1.0 万円）の安定した利益を目指すスイングトレードモデルに基づいています。AI は「守りの砦」であり、あなたの投資判断をデータで裏打ちするパートナーです。

---
最新の設計資料は `MASTER_BLUEPRINT.md` および `PROJECT_FULL_DETAILS.md` を参照してください。

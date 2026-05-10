# 🛡️ Crypto Sentinel - AI Development Rules

## 📁 Source of Truth (SSOT)
- テクニカル分析の数学的ロジック: `lib/shared/engine.ts`
- データベース・スキーマ: `supabase/migrations/`
- プロジェクト全貌: `PROJECT_FULL_DETAILS.md`

## 🛠️ Build & Commands
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Deploy**: `npm run deploy` (Cloudflare Workers via OpenNext)
- **Supabase**: `npx supabase functions deploy trade-advisor` (Edge Function のデプロイ)

## 📜 Coding Patterns
- **Next.js 16 (App Router)**: ルーティングとコンポーネント設計を遵守してください。
- **Tailwind CSS**: スタイル管理に使用します。CSS変数は `globals.css` で管理。
- **Shared Logic**: Edge Functions 側でも `lib/shared/engine.ts` のロジックを使用してください。
- **HITL (Human-in-the-Loop)**: AI による自動売買は行わず、`PENDING` ステータスとして保存し、ユーザーのダッシュボード承認フローを維持すること。

---
詳細は `AGENTS.md` を参照のこと。

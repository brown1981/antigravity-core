# 🛡️ Crypto Sentinel - Master Blueprint (v0.4 - Unified Logic)

## 📌 プロジェクト概要
- **目的**: 仮想通貨（BTC, ETH, XRP）のスイングトレードを支援する自律型ダッシュボード。
- **目標**: 月利 2.5% の安定運用。
- **技術スタック**: Next.js 15, Tailwind CSS, Supabase (Edge Functions), OpenAI (GPT-4o).

## 🚀 開発フェーズ
- **Phase 1-3**: ✅ 完了（ダッシュボード、履歴グラフ、勝率）
- **Phase 4**: ✅ 完了（AIエージェント、共有エンジン、HITLフロー）
- **Phase 5**: 🚀 次の目標（マルチエクスチェンジ連携、ポートフォリオ最適化）

---

## 🏗️ 統合アーキテクチャ (SOLID)
### 💎 共有エンジン (`lib/shared/engine.ts`)
- **Single Source of Truth (SSOT)**: 
  - すべてのテクニカル計算 (RSI, MACD, BB, SMA) を一元管理。
  - スコアからシグナルラベル（STRONG_BUY 等）への変換ロジックを統合。
  - Dashboard (Next.js) と Trade Advisor (Edge Functions) で 100% 同一の数値を保証。

### 🤖 AI Trade Advisor
- **ロジックの厳密化**: 
  - SMA 計算を UI と同期。
  - テクニカルスコアが 25点以上の時のみ、自律的に AI エージェント（GPT-4o）をコンパイル。
  - 需要がある場合のみユーザーへ「承認待ち」として通知。

---

## 📂 ディレクトリ構造
- `app/`: Next.js アプリケーション
- `lib/shared/engine.ts`: **システムの心臓部 (SSOT)**
- `supabase/functions/trade-advisor/`: 自律監視エージェント

---

## ⚠️ 次のエージェントへの引継ぎ事項
1. 計算ロジックを修正する場合は、必ず `lib/shared/engine.ts` のみを修正すること。
2. Edge Functions のデプロイ時は `import_map.json` の参照を確認すること。

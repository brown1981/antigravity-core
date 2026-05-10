# 🛡️ Crypto Sentinel - Project Full Details (v0.3)

このドキュメントは、これまでの開発経緯、技術選定、および現在のシステム状態を網羅したものです。高性能 AI（Claude 3.5 Sonnet 等）がプロジェクトの全貌を把握するためのマスター資料として機能します。

## 📌 プロジェクト概要
- **名称**: Crypto Sentinel（クリプト・センチネル）
- **目的**: 仮想通貨（BTC, ETH, XRP）のスイングトレードを支援する自律型ダッシュボード。
- **投資目標**: 元手40万円に対し、月利 2.5%（1.0万円/月）の安定運用。
- **基本戦略**: RSI, MACD, ボリンジャーバンドを用いた複合テクニカル分析によるエントリー判断。

## 🛠️ 技術スタック
- **Frontend**: Next.js 16.2.3 (App Router / Turbopack)
- **Styling**: Tailwind CSS
- **Backend / DB**: Supabase (PostgreSQL / Edge Functions)
- **Infrastructure**: Cloudflare Workers (OpenNext によるデプロイ)
- **API連携**: Binance API (市場データ), Resend (メールアラート)
- **Visualization**: Recharts

---

## 📅 開発フェーズの履歴

### Phase 1: MVP（基本機能の構築）
- **目標**: 主要コインのリアルタイム価格と基本指標（SMA25/75, RSI）の表示。
- **成果**: 
  - Binance API からのデータ取得ロジック構築。
  - 次世代風のダークモード UI の基盤作成。

### Phase 2: 分析の高度化 ＆ アラート
- **目標**: 複合指標（MACD, BB）の導入と監視の自動化。
- **成果**:
  - `lib/analysis.ts` にて -100 〜 +100 の複合シグナルスコア演算を実装。
  - XRPUSDT の追加。
  - Supabase Edge Functions を用いた 1時間ごとのアラート監視（Resend 連携）の構築。

### Phase 3: 履歴可視化 ＆ 実績トラッキング
- **目標**: 過去の推移グラフと取引の記録。
- **成果**:
  - `HistoryChart` コンポーネントによる 7日間のスコア推移表示。
  - `TradeForm` による手動取引記録機能の追加。
  - Cloudflare Worker 環境における非同期保存問題（await 必須化）の解消。

### Phase 4: 自律型 AI アドバイザーの実装 (COMPLETE)
- **目標**: 自律エージェントによる意思決定 ＆ ヒューマン・イン・ザ・ループの構築。
- **成果**:
  - Supabase Edge Function (`trade-advisor`) による自律監視・AI判定ロジック。
  - AI による「BUY/WAIT」判定と推奨理由（Reasoning）の自動生成。
  - ダッシュボードへの「AI 推薦リスト」とボタン一発でのエントリー承認・却下フロー。
  - 共有エンジンによるフロントエンド・バックエンドのロジック統合。

---

## 📊 データベース・スキーマ (Supabase)

### 1. `analysis_results` (分析履歴保存)
- 各分析実行時のスナップショット。グラフ描画のソース。
- `symbol`, `price`, `rsi`, `signal_score`, `macd_histogram`, `bb_position`, `created_at`

### 2. `trades` (取引実績記録)
- ユーザーによるエントリー記録。
- `symbol`, `direction` (BUY/SELL), `entry_price`, `amount_jpy`, `status` (OPEN/WIN/LOSS), `entry_at`

### 3. `alerts` (監視コントロール)
- アラートの閾値やアクティブ状態の管理。

---

## 🏁 結論
「Crypto Sentinel」は、Phase 1 〜 4 の全工程を完了しました。
単なる監視ツールとしての枠を越え、AI の知能と人間のリスク管理（HITL）が融合した、堅牢な自律型運用プラットフォームとしての基盤が完成しました。

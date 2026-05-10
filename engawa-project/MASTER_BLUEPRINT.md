# 🛡️ Crypto Sentinel - Master Blueprint
> **このドキュメントはAIモデル間の唯一の正典（Source of Truth）です。**
> モデルを切り替える際は、必ずこのファイルを最初に読み込んでください。

---

## 🏹 基本指針 (Core Philosophy)
1. **Simple First**: 動く機能を最優先。複雑な認証・多機能は後回し。
2. **Supabase First**: バックエンドロジックはSupabaseに一本化する。
3. **Context Sync**: 全モデルの作業結果・修正内容をこのドキュメントに記録する。
4. **Switch-Ready**: AIプロバイダーは環境変数1つで切り替え可能な設計にする。

---

## 🗺️ 全体ロードマップ

### Phase 1: 仮想通貨分析アプリ（現在）
- 目標: Supabase AI 機能の習得 + 動く分析ダッシュボード
- AI: Supabase 内蔵AI（pgvector + Hugging Face モデル）
- 認証: なし

### Phase 2: AI判定エンジンの高度化 + 販売準備
- 目標: 外部AI（Claude / OpenAI）への切り替え + 認証 + サブスク
- AI: 環境変数で切替（Supabase → Claude / OpenAI）
- 認証: Supabase Auth + 独自ドメイン（Safari問題の根本解決）

### Phase 3: AIエージェント自動運営会社（最終目標）
- 目標: AI が市場分析→判断→実行まで完全自動化
- Phase 1-2 の全資産を流用・拡張

---

## 🔑 プロジェクト接続情報
| 項目 | 値 |
|:---|:---|
| **Supabase Project URL** | `https://nixyhicyxdqviapohehh.supabase.co` |
| **Supabase Project ID** | `nixyhicyxdqviapohehh` |
| **GitHub Repo** | `github.com/brown1981/crypto-sentinel` (Private) |

---

## 🏗️ システム構成 (Architecture)

```
【インフラ構成】
ブラウザ（Next.js）
    │
    │← Supabase Realtime（リアルタイム更新）
    │
    ▼
Supabase Edge Functions（バックエンド一本化）
    ├── CoinGecko API 呼び出し（価格・OHLCVデータ取得）
    ├── RSI / SMA 計算ロジック
    ├── AIプロバイダー切替スイッチ（env: AI_PROVIDER）
    └── pgvector（Phase 2: パターン類似検索）
    │
    ▼
Supabase DB (PostgreSQL + pgvector)
    ├── price_snapshots（価格スナップショット）
    └── analysis_results（分析履歴・判定結果）

【フロント配信】
Cloudflare Workers → Next.js の静的アセット配信のみ
```

### AIプロバイダー切替設計
```typescript
// Edge Function 内スイッチ（コード変更不要で切替可能）
const AI_PROVIDER = Deno.env.get('AI_PROVIDER') || 'supabase';
// 'supabase' → Supabase内蔵AI（Phase 1）
// 'openai'   → OpenAI API（Phase 2）
// 'claude'   → Anthropic Claude（Phase 2）
```

---

## 📊 Phase 1 分析スコープ（完了）

| 項目 | 内容 |
|:---|:---|
| **対象通貨** | BTC/USDT, ETH/USDT |
| **データソース** | Binance API（Cloudflare Workers対応） |
| **取得指標** | 現在価格, SMA(25), SMA(75), RSI(14) |
| **AI判定** | ルールベース（RSI閾値 + SMAクロス） |
| **表示形式** | リアルタイム更新の1画面ダッシュボード |
| **認証** | なし |

## 🚀 Phase 2 分析スコープ（実装中）

### 投資戦略パラメータ
| 項目 | 値 |
|:---|:---|
| **元手** | 40万円 |
| **月間目標収益** | 1万円（月利2.5%） |
| **1回の投資額** | 20万円（元手の50%） |
| **利益目標** | +2.5%（+5,000円/回） |
| **損切りライン** | -1.5%（-3,000円/回） |
| **月トレード回数** | 4〜6回 |
| **スタイル** | スイングトレード |

### 追加指標
| 指標 | パラメータ | 用途 |
|:---|:---|:---|
| **MACD** | 12, 26, 9 | トレンド転換の検知 |
| **ボリンジャーバンド** | 20日, 2σ | 過熱・底値の視覚化 |

### 対象通貨（Phase 2）
| コイン | 取引所 | 選定理由 |
|:---|:---|:---|
| **BTC/JPY** | SBI VC Trade | 最大流動性・底堅い |
| **ETH/USDT** | Binance | 年足唯一の大型プラス |
| **XRP/JPY** | SBI VC Trade | SBI対応・出来高十分 |

### 判定基準（複合シグナル）
```
買いエントリー: RSI<40 + MACDゴールデンクロス + BB下限付近
利確条件:      RSI>65 + MACDデッドクロス + BB上限タッチ
アラート:      RSI<35 または MACDクロス発生でメール通知
```

### 判定基準（ルールベース）
```
RSI < 30  → ✅ Strong Buy
RSI 30-45 → 🟢 Buy  
RSI 45-55 → ⚪ Neutral
RSI 55-70 → 🟡 Sell
RSI > 70  → 🔴 Strong Sell
+ SMAクロス（短期が長期を上抜け → Buy補強 / 下抜け → Sell補強）
```

---

## 📋 作業履歴・進捗ログ

| 日付 | 担当モデル | フェーズ | 作業内容 | 結果・備考 |
|:---|:---|:---|:---|:---|
| 2026-04-08 | Antigravity | 前プロジェクト | Supabase + Cloudflare 構成で開発 | Safari認証問題で廃止。教訓を次に活かす |
| 2026-04-09 | Antigravity | 設計 | マスター設計図 初稿作成 | シンプルプランへ移行決定 |
| 2026-04-09 | Claude Sonnet 4.6 | 設計 | 全体ロードマップ策定・アーキテクチャ確定 | 3フェーズ構成承認済み |
| 2026-04-09 | Claude Sonnet 4.6 | セットアップ | Supabase・GitHub・Next.js の箱作成完了 | 全接続情報確定。実装フェーズ開始 |
| 2026-04-09 | Claude Sonnet 4.6 | **MVP完成** | ダッシュボード実装・Safari動作確認 | ✅ BTC/ETH リアルタイム表示成功。Safari問題ゼロ |

---

## 🚀 現在のタスク (Current Sprint: Phase 1)

- [x] Step 0: マスター設計図の作成・確定
- [x] Step 1: 新プロジェクトの初期構築（Next.js + Supabase連携設定）
- [x] Step 2: 分析エンジン実装（CoinGecko API + RSI/SMA計算）
- [x] Step 3: フロントエンド実装（リアルタイムダッシュボード）
- [x] Step 4: Safari動作確認（認証なし・完全動作）✅
- [ ] Step 5: Supabase DB連携（分析履歴の保存）
- [ ] Step 6: 本番デプロイ（Cloudflare Workers）
- [ ] Step 7: GitHub初回プッシュ

---

## 💡 将来メモ（Phase 2以降）
- 独自ドメイン導入でSafari認証問題を根本解決
- マルチテナント対応（Row Level Security）でアプリ販売準備
- サブスクTier設計（Free / Pro / Enterprise）

# User Guide: Memory Vitals Dashboard (agy-memory-vitals)

このダッシュボードは、Antigravity AIの「現在の思考状態」と「記憶の鮮度」をPresidentが直感的に管理するためのものです。

## 1. 画面構成と見方

### 左サイドパネル: GLOBAL RULES Monitor
- 現在適用されている「AIの憲法」の最新版が表示されます。
- ハイライトされている項目は、AIが特に意識して実行中のプロトコルです。

### 中央メインパネル: Memory Map & Gauges
- **Cognitive Load (認知負荷)**: AIの現在の処理負荷です。80%を超えると、記憶の整理（アーカイブ）を提案する可能性が高まります。
- **Memory Cards**: 
    - **Hot (Red)**: 現在のタスクに密接に関わる「熱い記憶」。
    - **Warm (Blue)**: Presidentの好みや標準ルール。
    - **Cold (Grey)**: 完了済みタスク。まもなくObsidianへ移行される候補。

### 右サイドパネル: Thought Trace & Signals
- **Thought Trace**: 「なぜAIがその判断をしたか」の履歴。どの過去の記憶と憲法を組み合わせたかを確認できます。
- **Signal A Detection**: Presidentの「飽き」や「迷い」を検知した際にアラートが出ます。

## 2. 操作方法

現在、このダッシュボードは「読み取り専用」ですが、今後のアップデートで以下が可能になります：
- **断捨離の承認**: 「Cold」カードを選択してアーカイブ実行。
- **ピン留め**: 特定の記憶を「絶対に忘れるな」と固定。
- **憲法の即時修正**: ルールをその場で編集。

## 3. 安全性について
- 内部メモリに含まれる可能性のあるAPIキーや個人情報は、`agy-security-sentry` によって自動的にマスク処理され、表示されません。

---
*Created by agy-docs-master*

# 🛠️ SKILL: SOLID_ENFORCEMENT (十戒執行)
---

## 📝 概要
ソースコードが `TECHNICAL_DECALOGUE.md`（技術の十戒）に適合しているかを自動監査し、必要に応じてリファクタリングの提案・実行を行う。

## 🎯 監視項目
1. **SRP (Single Responsibility)**: 一つのファイルに複数の関心が混在していないか。
2. **Naming (2-Words)**: 関数名や変数が曖昧でないか。
3. **DRY (Don't Repeat Yourself)**: 重複コードがないか。
4. **Physical Pure Check**: ハードコードされた不安定なパスがないか。

## 🔄 実行フロー
1. 対象アプリの `index.html` およびスクリプトを読み込む。
2. 十戒との乖離を指摘。
3. 司令官の承認を得て、SOLIDに準拠したコードへ「再定義（Refactor）」する。

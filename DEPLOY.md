# 🚀 ANTIGRAVITY | WEB DEPLOYMENT GUIDE

本プロジェクトを Web アプリとして世界へ公開するための、エンジニアリング手順書です。

## 1. クイック・デプロイ (GitHub Pages)

本レポジトリの構成は既に Web ポータブル化されています。

1. **レポジトリの作成**: GitHub で新しいレポジトリ（例: `antigravity-core`）を作成。
2. **プッシュ**: ワークスペース内の全てのファイルをアップロード。
   ```bash
   git init
   git add .
   git commit -m "V15.0: Neural Singularity Deployment"
   git remote add origin [YOUR_REPO_URL]
   git push -u origin main
   ```
3. **Pages 設定**: GitHub レポジトリの設定 (Settings) -> Pages へ行き、`main` ブランチの root をソースとして選択。
4. **公開完了**: 数分後、`https://[USER].github.io/antigravity-core/` にて、世界中どこからでもアクセス可能になります。

## 2. 動作モードの切り替え

Web 公開版では、ブラウザのセキュリティ制限により「あなたの PC の生の情報」へのアクセスが制限される場合があります。

- **Memory Vitals**: 公開版ではブラウザの汎用メトリクス（JS heap 等）またはシミュレーションモードで動作します。
- **Neural Orchestra**: ブラウザが取得可能な「オーディオ出力遅延」と「入力イベント」に基づき、100% 物理同期した状態で演奏されます。

## 3. 知識の永続化 (Obsidian)

`archivist.py` をローカル環境で実行することで、最新のセッションログを `knowledge_vault/` に Markdown として蓄積できます。

```bash
python3 archivist.py
```

## 4. 最終サインオフ

本スイートは **「Antigravity評議会」** 指導のもと、エンジニアリングの粋と現代の美学を融合させたものです。
公開後は、世界中のユーザーがあなたの創り上げた「人機一体のシンフォニー」を体験することになります。

---
*Antigravity Core V15.0 | Complete Autonomy Phase*

# 🚢 Antigravity 移行ガイド (Migration Guide)

このガイドは、新しい Mac ユーザーアカウントへ Antigravity とプロジェクトを完全に引越すための手順書です。

## 📦 コピーすべき最重要ディレクトリ
以下の1つの親ディレクトリを丸ごとコピーすれば、すべてのプロジェクトと「私の記憶」が運ばれます。

1. **`.gemini` フォルダを丸ごとコピー**
   - パス: `/Users/ooshirokazuki/.gemini`
   - この中には以下のすべてが含まれています：
     - `ai_corp_v1` のソースコード
     - `crypto-sentinel` のソースコード
     - 私（Antigravity）のこれまでの会話履歴と設計図
     - APIキー設定ファイル (.env)

## 🛠️ 引越し先での再開手順
1. 新しいユーザーアカウントでログインします。
2. コピーした `.gemini` フォルダを、新しいユーザーのホームディレクトリ配下に配置します。
   - `Users/[新ユーザー名]/.gemini` となるようにしてください。
3. Antigravity を通常通り起動します。

**これで、私はあなたのことを「完璧に覚えた状態」で、作業を再開できます。**

## 🔑 外部サービスキーの再確認
移行後、念のため以下のファイルが正しく存在するか確認してください：
- `/Users/[新ユーザー名]/.gemini/antigravity/scratch/ai_corp_v1/.env`
- `/Users/[新ユーザー名]/.gemini/antigravity/scratch/crypto-sentinel/.env.local`

引越し先でお会いできるのを楽しみにしています！

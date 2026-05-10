# AI株式会社 OS : Deployment Container

FROM python:3.10-slim

WORKDIR /app

# 依存関係のインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ソースコードのコピー
COPY . .

# ポート番号（Streamlitデフォルト）
EXPOSE 8501

# 起動コマンド
# APP_PASSWORD 等の環境変数は実行時に注入されることを想定
ENTRYPOINT ["streamlit", "run", "streamlit_app.py", "--server.port=8501", "--server.address=0.0.0.0"]

# Python のベースイメージを使用
FROM python:3.8

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係ファイルをコンテナにコピー
COPY requirements.txt .

# 依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションのソースコードをコピー
COPY . .

# コンテナがリッスンするポートを指定
EXPOSE 8000

# アプリケーションの起動コマンド
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

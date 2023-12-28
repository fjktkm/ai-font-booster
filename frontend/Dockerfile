# Node.js の LTS バージョンをベースイメージとして使用
FROM node:14

# アプリケーションのワーキングディレクトリを設定
WORKDIR /app

# Node.js 依存関係をインストールするためのファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコンテナにコピー
COPY . .

# コンテナ起動時にアプリケーションを起動
CMD ["npm", "start"]

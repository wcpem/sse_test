# ビルドステージ
FROM node:20-alpine AS builder

WORKDIR /app

# 依存関係をインストール
COPY package*.json ./
RUN npm ci

# アプリケーションコードをコピー
COPY . .

# ビルド
RUN npm run build

# 実行ステージ
FROM node:20-alpine

WORKDIR /app

# グローバルに serve をインストール（本番環境用）
RUN npm install -g serve

# ビルドステージからビルド結果をコピー
COPY --from=builder /app/dist ./dist

# ポート5173を公開
EXPOSE 5173

# アプリケーション起動
CMD ["serve", "-s", "dist", "-l", "5173"]

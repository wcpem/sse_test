# SSE Test Application

Server-Sent Events (SSE) テスト用のWebアプリケーションです。

## プロジェクト構成

```
sse_test/
├── frontend/          # Vite + React + TypeScript
│   ├── src/
│   │   ├── api/       # APIクライアント
│   │   ├── App.tsx
│   │   └── ...
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
│
├── backend/           # Python + FastAPI
│   ├── main.py        # メインアプリケーション
│   ├── requirements.txt
│   ├── .env
│   └── venv/          # 仮想環境
│
└── README.md
```

## セットアップ

### Docker を使用する場合（推奨）

前提条件：
- Docker
- Docker Compose

```bash
# プロジェクトルートで実行
docker-compose up --build
```

フロントエンド: `http://localhost:5173`
バックエンド: `http://localhost:8000`

### ローカル開発環境での実行

#### バックエンド

```bash
cd backend
source venv/bin/activate  # Linux/Mac
# または
venv\Scripts\activate     # Windows

pip install -r requirements.txt
python main.py
```

バックエンドは `http://localhost:8000` で起動します。

#### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

フロントエンドは `http://localhost:5173` で起動します。

## 実行

### Docker Compose で起動

```bash
# コンテナをビルドして起動
docker-compose up --build

# バックグラウンドで起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# 停止
docker-compose down
```

### 開発モード

docker-compose.yml では以下の設定で開発モードで実行されます：

- **バックエンド**: `--reload` フラグで自動リロード有効
- **フロントエンド**: `npm run dev` で HMR (Hot Module Replacement) 有効
- **ボリュームマウント**: ソースコード変更時に自動反映

## API エンドポイント

- `GET /` - ルートエンドポイント
- `GET /api/health` - ヘルスチェック

## トラブルシューティング

### ポートが既に使用されている場合

docker-compose.yml のポート設定を変更してください：

```yaml
services:
  backend:
    ports:
      - "8001:8000"  # ホストの8001ポートを使用
  frontend:
    ports:
      - "5174:5173"  # ホストの5174ポートを使用
```

### コンテナの再構築

```bash
docker-compose down
docker-compose up --build
```

### ボリュームのクリア

```bash
docker-compose down -v
```

## 技術スタック

### フロントエンド
- **Vite** - 高速なビルドツール
- **React** - UIライブラリ
- **TypeScript** - 型安全性

### バックエンド
- **FastAPI** - 高速なPython Webフレームワーク
- **Uvicorn** - ASGIサーバー
- **Pydantic** - データバリデーション

## ライセンス

MIT

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
import os
import asyncio
import json

# 環境変数を読み込む
load_dotenv()

app = FastAPI(
    title="SSE Test API",
    description="Server-Sent Events テスト用API",
    version="1.0.0"
)

# CORS設定
origins = [
    "http://localhost:5173",  # Viteのデフォルトポート
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {"message": "Welcome to SSE Test API"}


@app.get("/api/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "ok"}


async def event_generator():
    """SSEイベントジェネレータ"""
    message_count = 0
    while True:
        message_count += 1
        data = {
            "message": "SSE Message",
            "count": message_count,
            "timestamp": asyncio.get_event_loop().time()
        }
        yield f"data: {json.dumps(data)}\n\n"
        await asyncio.sleep(1)


@app.get("/api/events")
async def events():
    """SSEエンドポイント"""
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


@app.get("/api/analyze_sse")
async def analyze_sse():
    """SSEメッセージ分析エンドポイント"""
    return {"message": "Access OK"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

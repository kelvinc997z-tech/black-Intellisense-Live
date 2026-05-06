from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Import routes
from routes import auth_debug as auth, exchanges, wallets, markup, prices, orders, trades, chat, payments, settlements, api_trade, p2p, assets, reports, verification, payment_automation, admin, system

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Removed DB initialization from startup to prevent 500 errors during cold starts
    yield

app = FastAPI(
    title="Black IntelliSense API",
    description="Centralized API for Black IntelliSense Platforms",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Server is alive!"}

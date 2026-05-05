from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from database import engine, Base

from routes import auth, exchanges, wallets, markup, prices, orders, trades, chat, payments, settlements, api_trade, p2p, assets, reports

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables - Moved to manual migration/startup script to avoid Vercel timeouts
    try:
        # Only run this if explicitly needed, or handle via migrations
        # async with engine.begin() as conn:
        #     await conn.run_sync(Base.metadata.create_all)
        # print("Database tables verified.")
        pass
    except Exception as e:
        print(f"Startup DB check failed: {e}")
    
    yield
    await engine.dispose()

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

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(exchanges.router, prefix="/api/exchanges", tags=["Exchanges"])
app.include_router(wallets.router, prefix="/api/wallets", tags=["Wallets"])
app.include_router(markup.router, prefix="/api/markup", tags=["Markup"])
app.include_router(prices.router, prefix="/api/prices", tags=["Prices"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(trades.router, prefix="/api/trades", tags=["Trades"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(settlements.router, prefix="/api/settlements", tags=["Settlements"])
app.include_router(api_trade.router, prefix="/api/api-trade", tags=["API Trade"])
app.include_router(p2p.router, prefix="/api/p2p", tags=["P2P"])
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

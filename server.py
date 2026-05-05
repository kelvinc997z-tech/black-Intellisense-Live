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
    # Initialize database tables
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logging.info("Successfully connected to PostgreSQL and created tables")
        
        # AUTO-RESET ADMIN: Ensure admin account exists on every startup
        from routes.auth import reset_admin_password
        from database import SessionLocal
        async with SessionLocal() as db:
            await reset_admin_password(db=db)
            logging.info("Admin user account synchronized.")
            
    except Exception as e:
        logging.error(f"Failed to connect to PostgreSQL: {e}")
    
    yield
    # Cleanup
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
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(exchanges.router, prefix="/exchanges", tags=["Exchanges"])
app.include_router(wallets.router, prefix="/wallets", tags=["Wallets"])
app.include_router(markup.router, prefix="/markup", tags=["Markup"])
app.include_router(prices.router, prefix="/prices", tags=["Prices"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(trades.router, prefix="/trades", tags=["Trades"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(settlements.router, prefix="/settlements", tags=["Settlements"])
app.include_router(api_trade.router, prefix="/api-trade", tags=["API Trade"])
app.include_router(p2p.router, prefix="/p2p", tags=["P2P"])
app.include_router(assets.router, prefix="/assets", tags=["Assets"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])

from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from routes import auth, exchanges, wallets, markup, prices, orders, trades, chat, payments, settlements, api_trade, p2p, assets, reports

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

db = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    try:
        await db.command("ping")
        logging.info("Successfully connected to MongoDB")
    except Exception as e:
        logging.error(f"Failed to connect to MongoDB: {e}")
        raise
    
    yield
    
    client.close()
    logging.info("MongoDB connection closed")

app = FastAPI(title="Black IntelliSense API", lifespan=lifespan)

api_router = APIRouter(prefix="/api")

@api_router.get("/")
async def root():
    return {"message": "Black IntelliSense API", "version": "1.0.0"}

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(exchanges.router, prefix="/exchanges", tags=["Exchanges"])
api_router.include_router(wallets.router, prefix="/wallets", tags=["Wallets"])
api_router.include_router(markup.router, prefix="/markup", tags=["Markup Configuration"])
api_router.include_router(prices.router, prefix="/prices", tags=["Price Feeds"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(trades.router, prefix="/trades", tags=["Trades"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(settlements.router, prefix="/settlements", tags=["Settlements"])
api_router.include_router(api_trade.router, prefix="/api-trade", tags=["API Trade"])
api_router.include_router(p2p.router, prefix="/p2p", tags=["P2P Trading"])
api_router.include_router(assets.router, prefix="/assets", tags=["Assets"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_db():
    return db

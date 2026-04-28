from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import PriceFeed, ExchangeType, DBMarkupConfig
from routes.auth import get_current_user
from database import get_db
import uuid
from datetime import datetime, timezone
from typing import List
import random
import aiohttp

router = APIRouter()

async def fetch_coinmarketcap_price():
    """Fetch real USDT price from CoinMarketCap"""
    try:
        async with aiohttp.ClientSession() as session:
            # Using CoinGecko as free alternative (CoinMarketCap requires API key)
            async with session.get('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd') as response:
                if response.status == 200:
                    data = await response.json()
                    return data['tether']['usd']
    except Exception as e:
        print(f"Error fetching price: {e}")
    return 1.0  # Fallback to 1.0 if API fails

def generate_mock_price_feed(exchange: ExchangeType, base_price: float, symbol: str = "USDT"):
    bid_price = base_price - random.uniform(0.0001, 0.0003)
    ask_price = base_price + random.uniform(0.0001, 0.0003)
    spread = ((ask_price - bid_price) / bid_price) * 100
    
    return {
        "id": str(uuid.uuid4()),
        "exchange": exchange,
        "symbol": symbol,
        "bid_price": round(bid_price, 4),
        "ask_price": round(ask_price, 4),
        "spread": round(spread, 2),
        "volume_24h": random.uniform(150000, 700000),
        "timestamp": datetime.now(timezone.utc)
    }

@router.get("/", response_model=List[PriceFeed])
async def get_price_feeds(current_user: dict = Depends(get_current_user)):
    # Fetch real USDT price
    real_price = await fetch_coinmarketcap_price()
    
    exchanges = [ExchangeType.BINANCE, ExchangeType.OKEX, ExchangeType.HUOBI]
    feeds = [generate_mock_price_feed(ex, real_price) for ex in exchanges]
    
    return [PriceFeed(**feed) for feed in feeds]

@router.get("/best")
async def get_best_price(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(DBMarkupConfig).where(DBMarkupConfig.user_id == current_user["user_id"]))
    markup_config = result.scalar_one_or_none()
    
    percentage_markup = markup_config.percentage_markup if markup_config else 1.2
    
    # Fetch real USDT price
    real_price = await fetch_coinmarketcap_price()
    
    exchanges = [ExchangeType.BINANCE, ExchangeType.OKEX, ExchangeType.HUOBI]
    feeds = [generate_mock_price_feed(ex, real_price) for ex in exchanges]
    
    best_bid = max(feeds, key=lambda x: x["bid_price"])
    best_ask = min(feeds, key=lambda x: x["ask_price"])
    
    best_price = (best_bid["bid_price"] + best_ask["ask_price"]) / 2
    markup_applied = best_price * (1 + percentage_markup / 100)
    
    spread = ((best_ask["ask_price"] - best_bid["bid_price"]) / best_bid["bid_price"]) * 100
    
    total_volume = sum(f["volume_24h"] for f in feeds)
    
    return {
        "best_price": round(markup_applied, 4),
        "base_price": round(best_price, 4),
        "real_usdt_price": round(real_price, 4),
        "markup_percentage": percentage_markup,
        "spread": round(spread, 2),
        "volume_24h": round(total_volume, 2),
        "feeds": feeds
    }

@router.get("/history")
async def get_price_history(current_user: dict = Depends(get_current_user)):
    history = []
    base_time = datetime.now(timezone.utc)
    
    # Fetch current real price
    real_price = await fetch_coinmarketcap_price()
    
    for i in range(24):
        time_point = base_time.replace(hour=i, minute=0, second=0)
        # Add small random variation around real price
        price = real_price + random.uniform(-0.001, 0.001)
        history.append({
            "timestamp": time_point,
            "price": round(price, 4),
            "volume": random.uniform(10000, 50000)
        })
    
    return {"history": history}

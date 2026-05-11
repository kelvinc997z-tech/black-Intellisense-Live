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

async def fetch_yahoo_price(symbol, session=None):
    """Fetch real price from Yahoo Finance for a given symbol (e.g., 'USDIDR=X', 'BTC-USD')"""
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        async def _do_fetch(s):
            async with s.get(url, headers=headers, timeout=5) as response:
                if response.status == 200:
                    data = await response.json()
                    result = data.get("chart", {}).get("result", [])
                    if result and len(result) > 0:
                        return result[0].get("meta", {}).get("regularMarketPrice")
                return None

        if session:
            return await _do_fetch(session)
        else:
            async with aiohttp.ClientSession() as session:
                return await _do_fetch(session)
    except Exception as e:
        print(f"Error fetching Yahoo Finance price for {symbol}: {e}")
    return None

@router.get("/usd-idr")
async def get_usd_idr():
    price = await fetch_yahoo_price("USDIDR=X")
    if price:
        return {"symbol": "USD/IDR", "price": price}
    return {"symbol": "USD/IDR", "price": 15800.0, "error": "Fallback price used"}

@router.get("/ticker")
async def get_ticker():
    symbols = {
        "BTC": "BTC-USD",
        "ETH": "ETH-USD",
        "SOL": "SOL-USD",
        "BNB": "BNB-USD",
        "XRP": "XRP-USD"
    }
    results = []
    async with aiohttp.ClientSession() as session:
        for name, sym in symbols.items():
            price = await fetch_yahoo_price(sym, session=session)
            results.append({
                "symbol": name,
                "price": f"{price:.2f}" if price else "0.00",
                "change": "0.00%" 
            })
    return results

@router.get("/btc")
async def get_btc():
    price = await fetch_yahoo_price("BTC-USD")
    if price:
        return {"symbol": "BTC/USD", "price": price}
    return {"symbol": "BTC/USD", "price": 60000.0, "error": "Fallback price used"}

@router.get("/eth")
async def get_eth():
    price = await fetch_yahoo_price("ETH-USD")
    if price:
        return {"symbol": "ETH/USD", "price": price}
    return {"symbol": "ETH/USD", "price": 3000.0, "error": "Fallback price used"}

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

from fastapi import APIRouter, HTTPException, Depends, status
from models import ExchangeAPIConfig, OrderBook, OrderBookEntry
from routes.auth import get_current_user, require_admin
import uuid
from datetime import datetime, timezone
from typing import List, Dict
import random

router = APIRouter()

# Mock function to generate order book - replace with real exchange API later
def generate_mock_order_book(exchange: str, symbol: str = "BTC/USDT") -> OrderBook:
    base_price = 95000.0 if symbol == "BTC/USDT" else 3500.0
    
    bids = []
    asks = []
    
    for i in range(10):
        bid_price = base_price - (i * random.uniform(10, 50))
        bid_amount = random.uniform(0.1, 5.0)
        bids.append(OrderBookEntry(
            price=round(bid_price, 2),
            amount=round(bid_amount, 4),
            total=round(bid_price * bid_amount, 2)
        ))
        
        ask_price = base_price + (i * random.uniform(10, 50))
        ask_amount = random.uniform(0.1, 5.0)
        asks.append(OrderBookEntry(
            price=round(ask_price, 2),
            amount=round(ask_amount, 4),
            total=round(ask_price * ask_amount, 2)
        ))
    
    return OrderBook(
        exchange=exchange,
        symbol=symbol,
        bids=bids,
        asks=asks
    )

@router.get("/order-book/{exchange}/{symbol}")
async def get_order_book(exchange: str, symbol: str, current_user: dict = Depends(get_current_user)):
    """
    Get live order book from exchange
    TODO: Replace mock data with real exchange API integration
    Configure API keys in /api/api-trade/config
    """
    from server import get_db
    db = get_db()
    
    # Check if user has configured this exchange
    config = await db.exchange_api_configs.find_one({
        "user_id": current_user["user_id"],
        "exchange": exchange.lower(),
        "is_active": True
    })
    
    if not config:
        # Return mock data if no config
        order_book = generate_mock_order_book(exchange, symbol)
        return {
            "order_book": order_book,
            "is_live": False,
            "message": "Using demo data. Configure exchange API keys for live data."
        }
    
    # TODO: Add real exchange API integration here
    # if config["is_live"]:
    #     order_book = fetch_real_order_book(config["api_key"], config["api_secret"], symbol)
    # else:
    order_book = generate_mock_order_book(exchange, symbol)
    
    return {
        "order_book": order_book,
        "is_live": config.get("is_live", False),
        "message": "Live data" if config.get("is_live") else "Demo mode"
    }

@router.get("/config")
async def get_api_configs(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    configs = await db.exchange_api_configs.find({"user_id": current_user["user_id"]}).to_list(100)
    
    # Mask API secrets
    for config in configs:
        if "api_secret" in config:
            config["api_secret"] = "*" * 20
    
    return {"configs": configs}

@router.post("/config")
async def create_api_config(exchange: str, api_key: str, api_secret: str, is_live: bool = False, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    config_id = str(uuid.uuid4())
    config_doc = {
        "id": config_id,
        "user_id": current_user["user_id"],
        "exchange": exchange.lower(),
        "api_key": api_key,
        "api_secret": api_secret,
        "is_live": is_live,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.exchange_api_configs.insert_one(config_doc)
    
    return {
        "message": "API configuration saved successfully",
        "config_id": config_id,
        "note": "Please test the connection before enabling live mode"
    }

@router.patch("/config/{config_id}")
async def update_api_config(config_id: str, is_live: bool = None, is_active: bool = None, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    update_data = {}
    if is_live is not None:
        update_data["is_live"] = is_live
    if is_active is not None:
        update_data["is_active"] = is_active
    
    result = await db.exchange_api_configs.update_one(
        {"id": config_id, "user_id": current_user["user_id"]},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Configuration not found")
    
    return {"message": "Configuration updated successfully"}

@router.get("/available-symbols/{exchange}")
async def get_available_symbols(exchange: str, current_user: dict = Depends(get_current_user)):
    """
    Get available trading pairs from exchange
    TODO: Fetch from real exchange API
    """
    # Mock data - replace with real API call
    symbols = [
        {"symbol": "BTC/USDT", "base": "BTC", "quote": "USDT"},
        {"symbol": "ETH/USDT", "base": "ETH", "quote": "USDT"},
        {"symbol": "BNB/USDT", "base": "BNB", "quote": "USDT"},
        {"symbol": "SOL/USDT", "base": "SOL", "quote": "USDT"},
    ]
    
    return {"symbols": symbols}

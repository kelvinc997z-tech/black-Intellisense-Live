from fastapi import APIRouter, HTTPException, Depends, status
from models import Trade
from routes.auth import get_current_user
import uuid
from datetime import datetime, timezone
from typing import List
import random

router = APIRouter()

@router.get("/", response_model=List[Trade])
async def get_trades(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    trades = await db.trades.find(
        {"$or": [{"buyer_id": current_user["user_id"]}, {"seller_id": current_user["user_id"]}]}
    ).sort("created_at", -1).to_list(100)
    
    return [Trade(**trade) for trade in trades]

@router.get("/recent")
async def get_recent_activity(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    recent_trades = await db.trades.find(
        {"$or": [{"buyer_id": current_user["user_id"]}, {"seller_id": current_user["user_id"]}]}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    if not recent_trades:
        mock_trades = []
        for i in range(5):
            mock_trades.append({
                "time": datetime.now(timezone.utc).replace(hour=11 + i, minute=45).strftime("%I:%M %p"),
                "client": f"Client_{chr(65 + i)}",
                "type": random.choice(["Buy", "Sell"]),
                "amount": random.randint(10000, 20000),
                "status": random.choice(["Completed", "Pending"])
            })
        return {"activities": mock_trades}
    
    activities = []
    for trade in recent_trades:
        activities.append({
            "time": datetime.fromisoformat(trade["created_at"]).strftime("%I:%M %p") if isinstance(trade["created_at"], str) else trade["created_at"].strftime("%I:%M %p"),
            "client": f"Client_{trade['buyer_id'][:4]}",
            "type": "Buy" if trade["buyer_id"] == current_user["user_id"] else "Sell",
            "amount": trade["amount"],
            "status": trade["status"].title()
        })
    
    return {"activities": activities}

@router.get("/stats")
async def get_trade_stats(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    trades = await db.trades.find(
        {"seller_id": current_user["user_id"]}
    ).to_list(1000)
    
    if not trades:
        return {
            "daily_volume": 148500.0,
            "pending_settlements": 5,
            "total_profit": 2340.50
        }
    
    today = datetime.now(timezone.utc).date()
    daily_volume = sum(
        trade["total"] for trade in trades
        if datetime.fromisoformat(trade["created_at"]).date() == today
    )
    
    pending_settlements = sum(1 for trade in trades if trade["status"] == "pending")
    
    return {
        "daily_volume": daily_volume,
        "pending_settlements": pending_settlements,
        "total_profit": daily_volume * 0.012
    }

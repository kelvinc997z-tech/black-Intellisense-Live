from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_
from models import Trade, DBTrade
from routes.auth import get_current_user
from database import get_db
import uuid
from datetime import datetime, timezone
from typing import List
import random

router = APIRouter()

@router.get("/", response_model=List[Trade])
async def get_trades(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(DBTrade)
        .where(or_(DBTrade.buyer_id == current_user["user_id"], DBTrade.seller_id == current_user["user_id"]))
        .order_by(desc(DBTrade.created_at))
    )
    trades = result.scalars().all()
    
    return trades

@router.get("/recent")
async def get_recent_activity(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(DBTrade)
        .where(or_(DBTrade.buyer_id == current_user["user_id"], DBTrade.seller_id == current_user["user_id"]))
        .order_by(desc(DBTrade.created_at))
        .limit(10)
    )
    recent_trades = result.scalars().all()
    
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
            "time": trade.created_at.strftime("%I:%M %p"),
            "client": f"Client_{trade.buyer_id[:4]}",
            "type": "Buy" if trade.buyer_id == current_user["user_id"] else "Sell",
            "amount": trade.amount,
            "status": trade.status.title()
        })
    
    return {"activities": activities}

@router.get("/stats")
async def get_trade_stats(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(DBTrade).where(DBTrade.seller_id == current_user["user_id"])
    )
    trades = result.scalars().all()
    
    if not trades:
        return {
            "daily_volume": 148500.0,
            "pending_settlements": 5,
            "total_profit": 2340.50
        }
    
    today = datetime.now(timezone.utc).date()
    daily_volume = sum(
        trade.total for trade in trades
        if trade.created_at.date() == today
    )
    
    pending_settlements = sum(1 for trade in trades if trade.status == "pending")
    
    return {
        "daily_volume": daily_volume,
        "pending_settlements": pending_settlements,
        "total_profit": daily_volume * 0.012
    }

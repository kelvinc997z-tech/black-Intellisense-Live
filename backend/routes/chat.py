from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_, update, func
from models import ChatMessage, ChatMessageCreate, DBChatMessage
from routes.auth import get_current_user
from database import get_db
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.post("/", response_model=ChatMessage)
async def send_message(data: ChatMessageCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    message_id = str(uuid.uuid4())
    
    message_doc = DBChatMessage(
        id=message_id,
        trade_id=data.trade_id,
        sender_id=current_user["user_id"],
        receiver_id=data.receiver_id,
        message=data.message,
        is_read=False,
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(message_doc)
    await db.commit()
    await db.refresh(message_doc)
    
    return message_doc

@router.get("/trade/{trade_id}", response_model=List[ChatMessage])
async def get_trade_messages(trade_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(DBChatMessage)
        .where(
            DBChatMessage.trade_id == trade_id,
            or_(
                DBChatMessage.sender_id == current_user["user_id"],
                DBChatMessage.receiver_id == current_user["user_id"]
            )
        )
        .order_by(DBChatMessage.created_at)
    )
    messages = result.scalars().all()
    
    await db.execute(
        update(DBChatMessage)
        .where(
            DBChatMessage.trade_id == trade_id, 
            DBChatMessage.receiver_id == current_user["user_id"], 
            DBChatMessage.is_read == False
        )
        .values(is_read=True)
    )
    await db.commit()
    
    return messages

@router.get("/unread-count")
async def get_unread_count(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(func.count())
        .select_from(DBChatMessage)
        .where(DBChatMessage.receiver_id == current_user["user_id"], DBChatMessage.is_read == False)
    )
    count = result.scalar()
    
    return {"unread_count": count}

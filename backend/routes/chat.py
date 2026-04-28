from fastapi import APIRouter, HTTPException, Depends, status
from models import ChatMessage, ChatMessageCreate
from routes.auth import get_current_user
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.post("/", response_model=ChatMessage)
async def send_message(data: ChatMessageCreate, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    message_id = str(uuid.uuid4())
    message_doc = {
        "id": message_id,
        "trade_id": data.trade_id,
        "sender_id": current_user["user_id"],
        "receiver_id": data.receiver_id,
        "message": data.message,
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.chat_messages.insert_one(message_doc)
    
    return ChatMessage(**message_doc)

@router.get("/trade/{trade_id}", response_model=List[ChatMessage])
async def get_trade_messages(trade_id: str, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    messages = await db.chat_messages.find(
        {
            "trade_id": trade_id,
            "$or": [
                {"sender_id": current_user["user_id"]},
                {"receiver_id": current_user["user_id"]}
            ]
        }
    ).sort("created_at", 1).to_list(1000)
    
    await db.chat_messages.update_many(
        {"trade_id": trade_id, "receiver_id": current_user["user_id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return [ChatMessage(**msg) for msg in messages]

@router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    count = await db.chat_messages.count_documents(
        {"receiver_id": current_user["user_id"], "is_read": False}
    )
    
    return {"unread_count": count}

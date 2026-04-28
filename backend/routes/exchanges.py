from fastapi import APIRouter, HTTPException, Depends, status
from models import ExchangeConnection, ExchangeConnectionCreate, ExchangeType
from routes.auth import get_current_user
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.post("/", response_model=ExchangeConnection)
async def create_exchange_connection(data: ExchangeConnectionCreate, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    connection_id = str(uuid.uuid4())
    connection_doc = {
        "id": connection_id,
        "user_id": current_user["user_id"],
        "exchange": data.exchange,
        "api_key": data.api_key,
        "api_secret": data.api_secret,
        "is_active": True,
        "is_demo": data.is_demo,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.exchange_connections.insert_one(connection_doc)
    
    return ExchangeConnection(**connection_doc)

@router.get("/", response_model=List[ExchangeConnection])
async def get_exchange_connections(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    connections = await db.exchange_connections.find({"user_id": current_user["user_id"]}).to_list(100)
    
    return [ExchangeConnection(**conn) for conn in connections]

@router.delete("/{connection_id}")
async def delete_exchange_connection(connection_id: str, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    result = await db.exchange_connections.delete_one({"id": connection_id, "user_id": current_user["user_id"]})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    return {"message": "Connection deleted successfully"}

@router.patch("/{connection_id}/toggle")
async def toggle_connection(connection_id: str, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    connection = await db.exchange_connections.find_one({"id": connection_id, "user_id": current_user["user_id"]})
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    new_status = not connection.get("is_active", True)
    await db.exchange_connections.update_one(
        {"id": connection_id},
        {"$set": {"is_active": new_status}}
    )
    
    return {"message": "Connection status updated", "is_active": new_status}

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from models import ExchangeConnection, ExchangeConnectionCreate, ExchangeType, DBExchangeConnection
from routes.auth import get_current_user
from database import get_db
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.post("/", response_model=ExchangeConnection)
async def create_exchange_connection(data: ExchangeConnectionCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    connection_id = str(uuid.uuid4())
    
    connection_doc = DBExchangeConnection(
        id=connection_id,
        user_id=current_user["user_id"],
        exchange=data.exchange,
        api_key=data.api_key,
        api_secret=data.api_secret,
        is_active=True,
        is_demo=data.is_demo,
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(connection_doc)
    await db.commit()
    await db.refresh(connection_doc)
    
    return connection_doc

@router.get("/", response_model=List[ExchangeConnection])
async def get_exchange_connections(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(DBExchangeConnection).where(DBExchangeConnection.user_id == current_user["user_id"]))
    connections = result.scalars().all()
    
    return connections

@router.delete("/{connection_id}")
async def delete_exchange_connection(connection_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        delete(DBExchangeConnection).where(
            DBExchangeConnection.id == connection_id, 
            DBExchangeConnection.user_id == current_user["user_id"]
        )
    )
    await db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    return {"message": "Connection deleted successfully"}

@router.patch("/{connection_id}/toggle")
async def toggle_connection(connection_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(DBExchangeConnection).where(
            DBExchangeConnection.id == connection_id, 
            DBExchangeConnection.user_id == current_user["user_id"]
        )
    )
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    connection.is_active = not connection.is_active
    await db.commit()
    
    return {"message": "Connection status updated", "is_active": connection.is_active}

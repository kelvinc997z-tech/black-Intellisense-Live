from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from models import Asset, AssetCreate, AssetVisibilityUpdate, DBAsset
from routes.auth import get_current_user
from database import get_db
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.post("/", response_model=Asset)
async def create_asset(data: AssetCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Create new asset"""
    asset_id = str(uuid.uuid4())
    asset_doc = DBAsset(
        id=asset_id,
        user_id=current_user["user_id"],
        symbol=data.symbol,
        name=data.name,
        balance=data.balance,
        is_visible=data.is_visible,
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(asset_doc)
    await db.commit()
    await db.refresh(asset_doc)
    
    return asset_doc

@router.get("/", response_model=List[Asset])
async def get_assets(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get user's assets"""
    result = await db.execute(select(DBAsset).where(DBAsset.user_id == current_user["user_id"]))
    assets = result.scalars().all()
    
    return assets

@router.get("/visible", response_model=List[Asset])
async def get_visible_assets(user_id: str = None, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get visible assets for trading (for counterparties to see)"""
    target_user_id = user_id if user_id else current_user["user_id"]
    
    result = await db.execute(
        select(DBAsset).where(
            DBAsset.user_id == target_user_id,
            DBAsset.is_visible == True
        )
    )
    assets = result.scalars().all()
    
    return assets

@router.patch("/{asset_id}/visibility", response_model=Asset)
async def update_asset_visibility(asset_id: str, data: AssetVisibilityUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Update asset visibility for trading"""
    result = await db.execute(
        select(DBAsset).where(DBAsset.id == asset_id, DBAsset.user_id == current_user["user_id"])
    )
    asset = result.scalar_one_or_none()
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset.is_visible = data.is_visible
    await db.commit()
    await db.refresh(asset)
    
    return asset

@router.delete("/{asset_id}")
async def delete_asset(asset_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Delete asset"""
    result = await db.execute(
        delete(DBAsset).where(DBAsset.id == asset_id, DBAsset.user_id == current_user["user_id"])
    )
    await db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return {"message": "Asset deleted successfully"}

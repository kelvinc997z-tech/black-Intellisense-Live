from fastapi import APIRouter, HTTPException, Depends, status
from models import Asset, AssetCreate, AssetVisibilityUpdate
from routes.auth import get_current_user
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.post("/", response_model=Asset)
async def create_asset(data: AssetCreate, current_user: dict = Depends(get_current_user)):
    """Create new asset"""
    from server import get_db
    db = get_db()
    
    asset_id = str(uuid.uuid4())
    asset_doc = {
        "id": asset_id,
        "user_id": current_user["user_id"],
        "symbol": data.symbol,
        "name": data.name,
        "balance": data.balance,
        "is_visible": data.is_visible,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.assets.insert_one(asset_doc)
    
    return Asset(**asset_doc)

@router.get("/", response_model=List[Asset])
async def get_assets(current_user: dict = Depends(get_current_user)):
    """Get user's assets"""
    from server import get_db
    db = get_db()
    
    assets = await db.assets.find({"user_id": current_user["user_id"]}).to_list(100)
    
    return [Asset(**asset) for asset in assets]

@router.get("/visible", response_model=List[Asset])
async def get_visible_assets(user_id: str = None, current_user: dict = Depends(get_current_user)):
    """Get visible assets for trading (for counterparties to see)"""
    from server import get_db
    db = get_db()
    
    # If user_id provided, get that user's visible assets (for counterparties)
    # Otherwise get current user's visible assets
    target_user_id = user_id if user_id else current_user["user_id"]
    
    assets = await db.assets.find({
        "user_id": target_user_id,
        "is_visible": True
    }).to_list(100)
    
    return [Asset(**asset) for asset in assets]

@router.patch("/{asset_id}/visibility", response_model=Asset)
async def update_asset_visibility(asset_id: str, data: AssetVisibilityUpdate, current_user: dict = Depends(get_current_user)):
    """Update asset visibility for trading"""
    from server import get_db
    db = get_db()
    
    asset = await db.assets.find_one({"id": asset_id, "user_id": current_user["user_id"]})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    await db.assets.update_one(
        {"id": asset_id},
        {"$set": {"is_visible": data.is_visible}}
    )
    
    updated_asset = await db.assets.find_one({"id": asset_id})
    return Asset(**updated_asset)

@router.delete("/{asset_id}")
async def delete_asset(asset_id: str, current_user: dict = Depends(get_current_user)):
    """Delete asset"""
    from server import get_db
    db = get_db()
    
    result = await db.assets.delete_one({"id": asset_id, "user_id": current_user["user_id"]})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return {"message": "Asset deleted successfully"}

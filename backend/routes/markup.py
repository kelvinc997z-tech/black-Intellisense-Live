from fastapi import APIRouter, HTTPException, Depends, status
from models import MarkupConfig, MarkupConfigUpdate
from routes.auth import get_current_user
import uuid
from datetime import datetime, timezone

router = APIRouter()

@router.get("/", response_model=MarkupConfig)
async def get_markup_config(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    config = await db.markup_configs.find_one({"user_id": current_user["user_id"]})
    
    if not config:
        config_id = str(uuid.uuid4())
        default_config = {
            "id": config_id,
            "user_id": current_user["user_id"],
            "fixed_markup": 0.5,
            "percentage_markup": 1.2,
            "tiered_markup": {"retail": 1.5, "vip": 0.8},
            "min_trade_size": 1000.0,
            "max_trade_size": 100000.0,
            "max_slippage": 0.3,
            "auto_threshold": 50000.0,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.markup_configs.insert_one(default_config)
        return MarkupConfig(**default_config)
    
    return MarkupConfig(**config)

@router.patch("/", response_model=MarkupConfig)
async def update_markup_config(data: MarkupConfigUpdate, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    config = await db.markup_configs.find_one({"user_id": current_user["user_id"]})
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Markup config not found"
        )
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.markup_configs.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": update_data}
    )
    
    updated_config = await db.markup_configs.find_one({"user_id": current_user["user_id"]})
    return MarkupConfig(**updated_config)

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import MarkupConfig, MarkupConfigUpdate, DBMarkupConfig
from routes.auth import get_current_user
from database import get_db
import uuid
from datetime import datetime, timezone

router = APIRouter()

@router.get("/", response_model=MarkupConfig)
async def get_markup_config(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(DBMarkupConfig).where(DBMarkupConfig.user_id == current_user["user_id"]))
    config = result.scalar_one_or_none()
    
    if not config:
        config_id = str(uuid.uuid4())
        config = DBMarkupConfig(
            id=config_id,
            user_id=current_user["user_id"],
            fixed_markup=0.5,
            percentage_markup=1.2,
            tiered_markup={"retail": 1.5, "vip": 0.8},
            min_trade_size=1000.0,
            max_trade_size=100000.0,
            max_slippage=0.3,
            auto_threshold=50000.0,
            updated_at=datetime.now(timezone.utc)
        )
        db.add(config)
        await db.commit()
        await db.refresh(config)
    
    return config

@router.patch("/", response_model=MarkupConfig)
async def update_markup_config(data: MarkupConfigUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(DBMarkupConfig).where(DBMarkupConfig.user_id == current_user["user_id"]))
    config = result.scalar_one_or_none()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Markup config not found"
        )
    
    for key, value in data.model_dump().items():
        if value is not None:
            setattr(config, key, value)
    
    config.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(config)
    
    return config

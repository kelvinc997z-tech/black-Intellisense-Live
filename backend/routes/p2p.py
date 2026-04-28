from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from models import P2PMerchantPrice, P2PMerchantPriceCreate, DBP2PMerchantPrice, DBUser
from routes.auth import get_current_user
from database import get_db
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.post("/prices", response_model=P2PMerchantPrice)
async def create_merchant_price(data: P2PMerchantPriceCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Create or update merchant P2P price"""
    # Check if user is merchant or admin
    if current_user.get("role") not in ["merchant", "admin", "market_maker"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only merchants can set P2P prices"
        )
    
    price_id = str(uuid.uuid4())
    
    # Get merchant name from user
    result = await db.execute(select(DBUser).where(DBUser.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    merchant_name = user.full_name if user else "Merchant"
    
    price_doc = DBP2PMerchantPrice(
        id=price_id,
        merchant_id=current_user["user_id"],
        merchant_name=merchant_name,
        symbol=data.symbol,
        buy_price=data.buy_price,
        sell_price=data.sell_price,
        min_amount=data.min_amount,
        max_amount=data.max_amount,
        payment_methods=data.payment_methods,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    db.add(price_doc)
    await db.commit()
    await db.refresh(price_doc)
    
    return price_doc

@router.get("/prices", response_model=List[P2PMerchantPrice])
async def get_merchant_prices(symbol: str = None, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get all active merchant P2P prices"""
    query = select(DBP2PMerchantPrice).where(DBP2PMerchantPrice.is_active == True)
    if symbol:
        query = query.where(DBP2PMerchantPrice.symbol == symbol)
    
    result = await db.execute(query.order_by(DBP2PMerchantPrice.buy_price))
    prices = result.scalars().all()
    
    return prices

@router.get("/my-prices", response_model=List[P2PMerchantPrice])
async def get_my_merchant_prices(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get merchant's own prices"""
    result = await db.execute(
        select(DBP2PMerchantPrice)
        .where(DBP2PMerchantPrice.merchant_id == current_user["user_id"])
        .order_by(desc(DBP2PMerchantPrice.created_at))
    )
    prices = result.scalars().all()
    
    return prices

@router.patch("/prices/{price_id}")
async def update_merchant_price(price_id: str, data: P2PMerchantPriceCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Update merchant P2P price"""
    result = await db.execute(select(DBP2PMerchantPrice).where(DBP2PMerchantPrice.id == price_id))
    price = result.scalar_one_or_none()
    
    if not price:
        raise HTTPException(status_code=404, detail="Price not found")
    
    if price.merchant_id != current_user["user_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for key, value in data.model_dump().items():
        setattr(price, key, value)
    
    price.updated_at = datetime.now(timezone.utc)
    await db.commit()
    
    return {"message": "Price updated successfully"}

@router.delete("/prices/{price_id}")
async def delete_merchant_price(price_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Deactivate merchant P2P price"""
    result = await db.execute(select(DBP2PMerchantPrice).where(DBP2PMerchantPrice.id == price_id))
    price = result.scalar_one_or_none()
    
    if not price:
        raise HTTPException(status_code=404, detail="Price not found")
    
    if price.merchant_id != current_user["user_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    price.is_active = False
    await db.commit()
    
    return {"message": "Price deactivated successfully"}

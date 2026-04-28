from fastapi import APIRouter, HTTPException, Depends, status
from models import P2PMerchantPrice, P2PMerchantPriceCreate
from routes.auth import get_current_user
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.post("/prices", response_model=P2PMerchantPrice)
async def create_merchant_price(data: P2PMerchantPriceCreate, current_user: dict = Depends(get_current_user)):
    """Create or update merchant P2P price"""
    from server import get_db
    db = get_db()
    
    # Check if user is merchant or admin
    if current_user.get("role") not in ["merchant", "admin", "market_maker"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only merchants can set P2P prices"
        )
    
    price_id = str(uuid.uuid4())
    
    # Get merchant name from user
    user = await db.users.find_one({"id": current_user["user_id"]})
    merchant_name = user.get("full_name", "Merchant")
    
    price_doc = {
        "id": price_id,
        "merchant_id": current_user["user_id"],
        "merchant_name": merchant_name,
        "symbol": data.symbol,
        "buy_price": data.buy_price,
        "sell_price": data.sell_price,
        "min_amount": data.min_amount,
        "max_amount": data.max_amount,
        "payment_methods": data.payment_methods,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.p2p_merchant_prices.insert_one(price_doc)
    
    return P2PMerchantPrice(**price_doc)

@router.get("/prices", response_model=List[P2PMerchantPrice])
async def get_merchant_prices(symbol: str = None, current_user: dict = Depends(get_current_user)):
    """Get all active merchant P2P prices"""
    from server import get_db
    db = get_db()
    
    query = {"is_active": True}
    if symbol:
        query["symbol"] = symbol
    
    prices = await db.p2p_merchant_prices.find(query).sort("buy_price", 1).to_list(100)
    
    return [P2PMerchantPrice(**price) for price in prices]

@router.get("/my-prices", response_model=List[P2PMerchantPrice])
async def get_my_merchant_prices(current_user: dict = Depends(get_current_user)):
    """Get merchant's own prices"""
    from server import get_db
    db = get_db()
    
    prices = await db.p2p_merchant_prices.find(
        {"merchant_id": current_user["user_id"]}
    ).sort("created_at", -1).to_list(100)
    
    return [P2PMerchantPrice(**price) for price in prices]

@router.patch("/prices/{price_id}")
async def update_merchant_price(price_id: str, data: P2PMerchantPriceCreate, current_user: dict = Depends(get_current_user)):
    """Update merchant P2P price"""
    from server import get_db
    db = get_db()
    
    price = await db.p2p_merchant_prices.find_one({"id": price_id})
    if not price:
        raise HTTPException(status_code=404, detail="Price not found")
    
    if price["merchant_id"] != current_user["user_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = data.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.p2p_merchant_prices.update_one(
        {"id": price_id},
        {"$set": update_data}
    )
    
    return {"message": "Price updated successfully"}

@router.delete("/prices/{price_id}")
async def delete_merchant_price(price_id: str, current_user: dict = Depends(get_current_user)):
    """Deactivate merchant P2P price"""
    from server import get_db
    db = get_db()
    
    price = await db.p2p_merchant_prices.find_one({"id": price_id})
    if not price:
        raise HTTPException(status_code=404, detail="Price not found")
    
    if price["merchant_id"] != current_user["user_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.p2p_merchant_prices.update_one(
        {"id": price_id},
        {"$set": {"is_active": False}}
    )
    
    return {"message": "Price deactivated successfully"}

from fastapi import APIRouter, HTTPException, Depends, status
from models import Wallet, WalletCreate
from routes.auth import get_current_user
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.post("/", response_model=Wallet)
async def create_wallet(data: WalletCreate, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    wallet_id = str(uuid.uuid4())
    wallet_doc = {
        "id": wallet_id,
        "user_id": current_user["user_id"],
        "wallet_type": data.wallet_type,
        "address": data.address,
        "label": data.label,
        "balance": {"USDT": 520000.0, "USDC": 0.0},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.wallets.insert_one(wallet_doc)
    
    return Wallet(**wallet_doc)

@router.get("/", response_model=List[Wallet])
async def get_wallets(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    wallets = await db.wallets.find({"user_id": current_user["user_id"]}).to_list(100)
    
    return [Wallet(**wallet) for wallet in wallets]

@router.get("/total-balance")
async def get_total_balance(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    wallets = await db.wallets.find({"user_id": current_user["user_id"]}).to_list(100)
    
    total_balance = {}
    for wallet in wallets:
        balance = wallet.get("balance", {})
        for currency, amount in balance.items():
            total_balance[currency] = total_balance.get(currency, 0) + amount
    
    return {"total_balance": total_balance}

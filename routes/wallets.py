from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import Wallet, WalletCreate, DBWallet
from routes.auth import get_current_user
from database import get_db
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.post("/", response_model=Wallet)
async def create_wallet(data: WalletCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    wallet_id = str(uuid.uuid4())
    
    wallet_doc = DBWallet(
        id=wallet_id,
        user_id=current_user["user_id"],
        wallet_type=data.wallet_type,
        address=data.address,
        label=data.label,
        balance={"USDT": 520000.0, "USDC": 0.0},
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(wallet_doc)
    await db.commit()
    await db.refresh(wallet_doc)
    
    return wallet_doc

@router.get("/", response_model=List[Wallet])
async def get_wallets(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(DBWallet).where(DBWallet.user_id == current_user["user_id"]))
    wallets = result.scalars().all()
    
    return wallets

@router.get("/total-balance")
async def get_total_balance(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(DBWallet).where(DBWallet.user_id == current_user["user_id"]))
    wallets = result.scalars().all()
    
    total_balance = {}
    for wallet in wallets:
        balance = wallet.balance or {}
        for currency, amount in balance.items():
            total_balance[currency] = total_balance.get(currency, 0.0) + amount
    
    return {"total_balance": total_balance}

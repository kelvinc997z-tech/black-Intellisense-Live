from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from models import (
    DBUserBankDetail, UserBankDetail, UserBankDetailCreate,
    DBFiatRequest, FiatRequest, FiatRequestCreate, FiatRequestUpdate,
    FiatRequestType, FiatRequestStatus
)
from routes.auth import get_current_user
from database import get_db
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.get("/bank-details", response_model=UserBankDetail)
async def get_bank_details(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(DBUserBankDetail).where(DBUserBankDetail.user_id == current_user["user_id"]))
    details = result.scalar_one_or_none()
    
    if not details:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bank details not found")
    
    return details

@router.post("/bank-details", response_model=UserBankDetail)
async def save_bank_details(details: UserBankDetailCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(DBUserBankDetail).where(DBUserBankDetail.user_id == current_user["user_id"]))
    db_details = result.scalar_one_or_none()
    
    if db_details:
        db_details.bank_name = details.bank_name
        db_details.account_number = details.account_number
        db_details.account_holder = details.account_holder
        db_details.updated_at = datetime.now(timezone.utc)
    else:
        db_details = DBUserBankDetail(
            id=str(uuid.uuid4()),
            user_id=current_user["user_id"],
            bank_name=details.bank_name,
            account_number=details.account_number,
            account_holder=details.account_holder
        )
        db.add(db_details)
    
    await db.commit()
    await db.refresh(db_details)
    return db_details

@router.post("/request", response_model=FiatRequest)
async def create_fiat_request(req: FiatRequestCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    new_request = DBFiatRequest(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        type=req.type,
        amount=req.amount,
        currency=req.currency,
        proof_hash=req.proof_hash,
        status=FiatRequestStatus.PENDING
    )
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)
    return new_request

@router.get("/requests", response_model=List[FiatRequest])
async def get_fiat_requests(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    query = select(DBFiatRequest)
    if current_user.get("role") not in ["admin", "market_maker"]:
        query = query.where(DBFiatRequest.user_id == current_user["user_id"])
    
    result = await db.execute(query.order_by(desc(DBFiatRequest.created_at)))
    return result.scalars().all()

@router.patch("/requests/{request_id}", response_model=FiatRequest)
async def update_fiat_request(request_id: str, update: FiatRequestUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "market_maker"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    
    result = await db.execute(select(DBFiatRequest).where(DBFiatRequest.id == request_id))
    req = result.scalar_one_or_none()
    
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    
    req.status = update.status
    req.admin_notes = update.admin_notes
    req.admin_id = current_user["user_id"]
    req.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(req)
    return req

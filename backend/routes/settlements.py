from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from models import Settlement, SettlementUpdate, SettlementStatus, DBSettlement
from routes.auth import get_current_user
from database import get_db
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.get("/", response_model=List[Settlement])
async def get_settlements(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Admins and market_makers can see all, counterparties see only their own
    query = select(DBSettlement)
    if current_user.get("role") not in ["admin", "market_maker"]:
        query = query.where(DBSettlement.counterparty_id == current_user["user_id"])
    
    result = await db.execute(query.order_by(desc(DBSettlement.created_at)).limit(100))
    settlements = result.scalars().all()
    
    return settlements

@router.post("/create")
async def create_settlement(trade_id: str, payment_proof_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    settlement_id = str(uuid.uuid4())
    settlement_doc = DBSettlement(
        id=settlement_id,
        trade_id=trade_id,
        payment_proof_id=payment_proof_id,
        status=SettlementStatus.PENDING,
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(settlement_doc)
    await db.commit()
    await db.refresh(settlement_doc)
    
    return settlement_doc

@router.patch("/{settlement_id}", response_model=Settlement)
async def update_settlement(settlement_id: str, data: SettlementUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(DBSettlement).where(DBSettlement.id == settlement_id))
    settlement = result.scalar_one_or_none()
    
    if not settlement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settlement not found"
        )
    
    settlement.status = data.status
    if data.notes:
        settlement.notes = data.notes
    
    if data.status in [SettlementStatus.APPROVED, SettlementStatus.COMPLETED]:
        settlement.approved_by = current_user["user_id"]
        settlement.approved_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(settlement)
    
    return settlement

@router.get("/pending-count")
async def get_pending_count(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(func.count())
        .select_from(DBSettlement)
        .where(DBSettlement.status == SettlementStatus.PENDING)
    )
    count = result.scalar()
    
    return {"pending_count": count}

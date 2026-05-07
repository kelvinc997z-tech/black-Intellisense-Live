from fastapi import APIRouter, HTTPException, Depends, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import engine, Base
from database import get_db
from typing import Optional
from models import DBUser, UserRole

router = APIRouter()

# In production, move this to .env
ADMIN_SYNC_KEY = "sync_secret_99"

@router.post("/approve-settlement")
async def approve_settlement(
    settlement_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Multisig Approval: Add admin approval to a settlement.
    If the settlement exceeds the threshold, multiple approvals are required.
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    result = await db.execute(select(DBSettlement).where(DBSettlement.id == settlement_id))
    settlement = result.scalar_one_or_none()
    
    if not settlement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Settlement not found")
    
    approvals = settlement.approvals or []
    if current_user["user_id"] in approvals:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already approved by this admin")
    
    approvals.append(current_user["user_id"])
    settlement.approvals = approvals
    
    # Logic: If amount > 100k, require 2 approvals to mark as APPROVED
    threshold = 100000.0
    if settlement.amount > threshold:
        if len(approvals) >= 2:
            settlement.status = SettlementStatus.APPROVED
            settlement.approved_by = current_user["user_id"]
            settlement.approved_at = datetime.now(timezone.utc)
    else:
        # Small trades only need 1 approval
        settlement.status = SettlementStatus.APPROVED
        settlement.approved_by = current_user["user_id"]
        settlement.approved_at = datetime.now(timezone.utc)
        
    await db.commit()
    await db.refresh(settlement)
    
    return {
        "status": "success",
        "current_approvals": len(approvals),
        "required_approvals": 2 if settlement.amount > threshold else 1,
        "settlement_status": settlement.status
    }

@router.post("/sync-db")
async def sync_database(
    x_admin_key: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually synchronize database schema.
    Call this once after deploying new models to create missing tables.
    """
    if x_admin_key != ADMIN_SYNC_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin sync key"
        )
    
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        return {"status": "success", "message": "Database schema synchronized successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database sync failed: {str(e)}"
        )

@router.get("/force-admin")
async def force_admin_get(
    email: str,
    x_admin_key: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Allow GET request for easy browser access to force admin role.
    """
    return await force_admin_logic(email, x_admin_key, db)

@router.post("/force-admin")
async def force_admin_post(
    email: str,
    x_admin_key: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    return await force_admin_logic(email, x_admin_key, db)

async def force_admin_logic(email: str, x_admin_key: str, db: AsyncSession):
    if x_admin_key != ADMIN_SYNC_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin sync key"
        )
    
    result = await db.execute(select(DBUser).where(DBUser.email == email.lower().strip()))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.role = UserRole.ADMIN
    await db.commit()
    await db.refresh(user)
    
    return {
        "status": "success",
        "message": f"User {email} is now an ADMIN",
        "user_id": user.id
    }

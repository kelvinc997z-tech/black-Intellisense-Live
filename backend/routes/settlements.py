from fastapi import APIRouter, HTTPException, Depends, status
from models import Settlement, SettlementUpdate, SettlementStatus
from routes.auth import get_current_user
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.get("/", response_model=List[Settlement])
async def get_settlements(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    # Admins and market_makers can see all, counterparties see only their own
    query = {}
    if current_user.get("role") not in ["admin", "market_maker"]:
        query = {"user_id": current_user["user_id"]}
    
    settlements = await db.settlements.find(query).sort("created_at", -1).limit(100).to_list(100)
    
    return [Settlement(**settlement) for settlement in settlements]

@router.post("/create")
async def create_settlement(trade_id: str, payment_proof_id: str, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    settlement_id = str(uuid.uuid4())
    settlement_doc = {
        "id": settlement_id,
        "trade_id": trade_id,
        "payment_proof_id": payment_proof_id,
        "status": SettlementStatus.PENDING,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.settlements.insert_one(settlement_doc)
    
    return Settlement(**settlement_doc)

@router.patch("/{settlement_id}", response_model=Settlement)
async def update_settlement(settlement_id: str, data: SettlementUpdate, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    settlement = await db.settlements.find_one({"id": settlement_id})
    if not settlement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settlement not found"
        )
    
    update_data = {"status": data.status}
    if data.notes:
        update_data["notes"] = data.notes
    
    if data.status in [SettlementStatus.APPROVED, SettlementStatus.COMPLETED]:
        update_data["approved_by"] = current_user["user_id"]
        update_data["approved_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.settlements.update_one(
        {"id": settlement_id},
        {"$set": update_data}
    )
    
    updated_settlement = await db.settlements.find_one({"id": settlement_id})
    return Settlement(**updated_settlement)

@router.get("/pending-count")
async def get_pending_count(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    count = await db.settlements.count_documents({"status": SettlementStatus.PENDING})
    
    return {"pending_count": count}

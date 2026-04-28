from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from models import PaymentProof, PaymentStatus
from routes.auth import get_current_user
import uuid
from datetime import datetime, timezone
from typing import List
import aiofiles
import os

router = APIRouter()

UPLOAD_DIR = "./uploads/payment_proofs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_payment_proof(
    trade_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    from server import get_db
    db = get_db()
    
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, and PDF files are supported"
        )
    
    file_id = str(uuid.uuid4())
    file_extension = file.filename.split(".")[-1]
    file_name = f"{file_id}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    mock_ocr_data = {
        "amount": 15000.0,
        "reference_code": f"TXN{uuid.uuid4().hex[:8].upper()}",
        "merchant_name": "Bank Transfer",
        "date": datetime.now(timezone.utc).isoformat()
    }
    
    proof_id = str(uuid.uuid4())
    proof_doc = {
        "id": proof_id,
        "trade_id": trade_id,
        "user_id": current_user["user_id"],
        "file_name": file.filename,
        "file_url": f"/uploads/payment_proofs/{file_name}",
        "ocr_data": mock_ocr_data,
        "status": PaymentStatus.UPLOADED,
        "reference_code": mock_ocr_data["reference_code"],
        "amount": mock_ocr_data["amount"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_proofs.insert_one(proof_doc)
    
    return PaymentProof(**proof_doc)

@router.get("/", response_model=List[PaymentProof])
async def get_payment_proofs(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    # Role-based access: admins/market_makers see all, others see only their own
    query = {}
    if current_user.get("role") not in ["admin", "market_maker"]:
        query = {"user_id": current_user["user_id"]}
    
    proofs = await db.payment_proofs.find(query).sort("created_at", -1).limit(100).to_list(100)
    
    return [PaymentProof(**proof) for proof in proofs]

@router.get("/trade/{trade_id}", response_model=List[PaymentProof])
async def get_trade_payment_proofs(trade_id: str, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    proofs = await db.payment_proofs.find({"trade_id": trade_id}).sort("created_at", -1).to_list(100)
    
    return [PaymentProof(**proof) for proof in proofs]

@router.patch("/{proof_id}/verify")
async def verify_payment_proof(proof_id: str, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    proof = await db.payment_proofs.find_one({"id": proof_id})
    if not proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment proof not found"
        )
    
    await db.payment_proofs.update_one(
        {"id": proof_id},
        {"$set": {"status": PaymentStatus.VERIFIED}}
    )
    
    return {"message": "Payment verified successfully"}

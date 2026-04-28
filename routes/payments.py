from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from models import PaymentProof, PaymentStatus, DBPaymentProof
from routes.auth import get_current_user
from database import get_db
import uuid
from datetime import datetime, timezone
from typing import List
import aiofiles
import os

router = APIRouter()

UPLOAD_DIR = "/tmp/uploads/payment_proofs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_payment_proof(
    trade_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
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
    proof_doc = DBPaymentProof(
        id=proof_id,
        trade_id=trade_id,
        user_id=current_user["user_id"],
        file_name=file.filename,
        file_url=f"/uploads/payment_proofs/{file_name}",
        ocr_data=mock_ocr_data,
        status=PaymentStatus.UPLOADED,
        reference_code=mock_ocr_data["reference_code"],
        amount=mock_ocr_data["amount"],
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(proof_doc)
    await db.commit()
    await db.refresh(proof_doc)
    
    return proof_doc

@router.get("/", response_model=List[PaymentProof])
async def get_payment_proofs(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Role-based access: admins/market_makers see all, others see only their own
    query = select(DBPaymentProof)
    if current_user.get("role") not in ["admin", "market_maker"]:
        query = query.where(DBPaymentProof.user_id == current_user["user_id"])
    
    result = await db.execute(query.order_by(desc(DBPaymentProof.created_at)).limit(100))
    proofs = result.scalars().all()
    
    return proofs

@router.get("/trade/{trade_id}", response_model=List[PaymentProof])
async def get_trade_payment_proofs(trade_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(DBPaymentProof)
        .where(DBPaymentProof.trade_id == trade_id)
        .order_by(desc(DBPaymentProof.created_at))
    )
    proofs = result.scalars().all()
    
    return proofs

@router.patch("/{proof_id}/verify")
async def verify_payment_proof(proof_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(DBPaymentProof).where(DBPaymentProof.id == proof_id))
    proof = result.scalar_one_or_none()
    
    if not proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment proof not found"
        )
    
    proof.status = PaymentStatus.VERIFIED
    await db.commit()
    
    return {"message": "Payment verified successfully"}

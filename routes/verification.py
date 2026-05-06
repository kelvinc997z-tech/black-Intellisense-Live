from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import DBUserVerification, DBUser
from routes.auth import get_current_user
from database import get_db
import uuid
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter()

class ZKProofRequest(BaseModel):
    proof: str
    provider: str = "reclaim"
    verification_type: str # e.g., "balance_proof", "identity_proof"
    data: Optional[Dict[str, Any]] = None

async def mock_verify_with_provider(proof: str, provider: str, data: Dict[str, Any]):
    """
    MOCK FUNCTION: In production, this would call an external zkTLS provider API.
    """
    # ZK Pass specific mock logic
    if provider == "zkpass":
        # ZK Pass usually involves verifying a 'Pass' against a specific schema
        # For demo, we expect the proof to contain 'zkpass_proof_'
        if proof.startswith("zkpass_proof_"):
            return {
                "status": "success",
                "verified_data": data if data else {"verified_attribute": "account_balance", "value": 50000},
                "proof_hash": f"zkp_{uuid.uuid4().hex[:12]}",
                "schema": "ZKPASS_BALANCE_VERIFICATION_V1"
            }
        return {"status": "failed", "error": "ZK Pass proof is invalid or expired"}
    
    # Reclaim Protocol mock logic
    if proof.startswith("valid_"):
        return {
            "status": "success",
            "verified_data": data if data else {"status": "verified", "amount": 10000},
            "proof_hash": f"hash_{uuid.uuid4().hex[:10]}"
        }
    return {"status": "failed", "error": "Invalid zero-knowledge proof"}

@router.post("/verify-zk-proof")
async def verify_zk_proof(
    request: ZKProofRequest, 
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """Verify a zkTLS proof submitted by the user"""
    
    # 1. Call external provider to verify the ZK Proof
    verification_result = await mock_verify_with_provider(
        request.proof, 
        request.provider, 
        request.data
    )
    
    if verification_result["status"] == "failed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"ZK Proof verification failed: {verification_result.get('error')}"
        )
    
    # 2. Save the verification record to the database
    verification_id = str(uuid.uuid4())
    verification_doc = DBUserVerification(
        id=verification_id,
        user_id=current_user["user_id"],
        method="zkTLS",
        provider=request.provider,
        proof_hash=verification_result["proof_hash"],
        verified_data=verification_result["verified_data"],
        status="verified",
        created_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30) # Proof valid for 30 days
    )
    
    db.add(verification_doc)
    await db.commit()
    
    return {
        "message": "Verification successful",
        "verification_id": verification_id,
        "verified_data": verification_result["verified_data"]
    }

@router.get("/status")
async def get_verification_status(
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """Check if the current user has any active verifications"""
    result = await db.execute(
        select(DBUserVerification).where(
            DBUserVerification.user_id == current_user["user_id"],
            DBUserVerification.status == "verified"
        )
    )
    verifications = result.scalars().all()
    
    return {
        "is_verified": len(verifications) > 0,
        "verifications": [
            {
                "method": v.method,
                "provider": v.provider,
                "created_at": v.created_at,
                "expires_at": v.expires_at
            } for v in verifications
        ]
    }

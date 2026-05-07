from fastapi import APIRouter, HTTPException, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import DBUserVerification, DBUser
from routes.auth import get_current_user
from database import get_db
from utils.zk_service import zk_verifier
from utils.heartbeat_service import heartbeat_service
import uuid
import os
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

# Move heavy imports inside functions to prevent server crash at startup
# from reclaim_python_sdk import verify_proof, Proof, ReclaimProofRequest

router = APIRouter()

class ZKProofRequest(BaseModel):
    proof: str
    provider: str = "reclaim"
    verification_type: str # e.g., "balance_proof", "identity_proof"
    data: Optional[Dict[str, Any]] = None

class SolvencyProofRequest(BaseModel):
    proof: Dict[str, Any] # { a: [], b: [], c: [] }
    public_signals: List[int] # [isSolvent, threshold]

class IdentityProofRequest(BaseModel):
    proof: Dict[str, Any] # { a: [], b: [], c: [] }
    public_signals: List[int] # [commitment]

async def verify_reclaim_proof(proof_data: Dict[str, Any]):
    """
    Verifies a Reclaim Protocol proof using the Python SDK.
    """
    try:
        from reclaim_python_sdk import verify_proof, Proof
        proof = Proof.from_json(proof_data)
        provider_id = os.getenv("RECLAIM_PROVIDER_ID", "your_default_provider_id")
        
        result = await verify_proof(proof, {"providerId": provider_id})
        
        if not result.is_verified:
            return {"status": "failed", "error": str(result.error)}
        
        return {
            "status": "success",
            "verified_data": result.data[0].extracted_parameters,
            "proof_hash": result.data[0].proof_hash if hasattr(result.data[0], 'proof_hash') else uuid.uuid4().hex[:12]
        }
    except Exception as e:
        return {"status": "failed", "error": f"Verification exception: {str(e)}"}

async def mock_verify_with_provider(proof: str, provider: str, data: Dict[str, Any]):
    """
    Verifies a proof. For 'reclaim', it uses the real SDK. For others, it's a mock.
    """
    if provider == "reclaim":
        # In a real flow, 'proof' here might be the proof data JSON
        # For compatibility with existing /verify-zk-proof, we handle it as a string or dict
        import json
        try:
            proof_json = json.loads(proof) if isinstance(proof, str) else proof
            return await verify_reclaim_proof(proof_json)
        except:
            return {"status": "failed", "error": "Invalid JSON proof data for Reclaim"}

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

@router.post("/reclaim/request")
async def create_reclaim_request(
    trade_id: str, # Move to front: parameter without default must come first
    current_user: dict = Depends(get_current_user)
):
    """
    Initialize a Reclaim proof request and return the request URL.
    """
    try:
        from reclaim_python_sdk import ReclaimProofRequest
        app_id = os.getenv("RECLAIM_APP_ID", "your_app_id")
        app_secret = os.getenv("RECLAIM_APP_SECRET", "your_app_secret")
        provider_id = os.getenv("RECLAIM_PROVIDER_ID", "your_provider_id")
        
        # Initialize request
        proof_request = await ReclaimProofRequest.init(
            app_id=app_id,
            app_secret=app_secret,
            provider_id=provider_id,
        )
        
        # Add contextual data so the callback knows which user and trade this is for
        proof_request.set_context({
            "user_id": current_user["user_id"],
            "trade_id": trade_id
        })
        
        # Set callback URL where Reclaim will send the proof
        callback_url = f"https://{os.getenv('API_DOMAIN', 'api.blackintellisense.com')}/verification/reclaim/callback"
        proof_request.set_app_callback_url(callback_url)
        
        request_url = await proof_request.get_request_url()
        
        return {
            "request_url": request_url,
            "message": "Please scan the QR code or open the URL in the Reclaim App."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create Reclaim request: {str(e)}")

@router.post("/reclaim/callback")
async def reclaim_callback(
    request: Request, 
    db: AsyncSession = Depends(get_db)
):
    """
    Callback endpoint for Reclaim Protocol to send verified proof data.
    """
    try:
        proof_data = await request.json()
        verification_result = await verify_reclaim_proof(proof_data)
        
        if verification_result["status"] == "failed":
            return {"status": "error", "message": verification_result["error"]}, 400
        
        # Associate this proof with a user and a trade
        context = proof_data.get("context", {})
        user_id = context.get("user_id")
        trade_id = context.get("trade_id") # Crucial for OTC Escrow
        
        if not user_id or not trade_id:
            return {"status": "error", "message": "Missing user_id or trade_id in proof context"}, 400

        # 1. LOCK TRADE ON CHAIN (The ZK-Locked Escrow step)
        blockchain_success = await zk_verifier.lock_trade_on_chain(trade_id)
        if not blockchain_success:
            return {"status": "error", "message": "Failed to lock trade on blockchain"}, 500

        # 2. Save the verification record to DB
        verification_id = str(uuid.uuid4())
        verification_doc = DBUserVerification(
            id=verification_id,
            user_id=user_id,
            method="zkTLS-Escrow",
            provider="reclaim",
            proof_hash=verification_result["proof_hash"],
            verified_data={
                **verification_result["verified_data"],
                "trade_id": trade_id,
                "blockchain_locked": True
            },
            status="verified",
            created_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc) + timedelta(days=30)
        )
        
        db.add(verification_doc)
        await db.commit()
        
        return {
            "status": "success",
            "message": "Proof verified and Trade locked in Escrow",
            "verification_id": verification_id,
            "trade_id": trade_id
        }
    except Exception as e:
        return {"status": "error", "message": f"Callback error: {str(e)}"}, 500

@router.get("/solvency/threshold")
async def get_solvency_threshold():
    """Get the current minimum balance required for solvency verification"""
    # In production, this could be dynamic based on user level or global config
    return {"threshold": 10000, "currency": "USDT", "description": "Minimum balance to be verified as solvent"}

@router.post("/solvency/verify")
async def verify_solvency(
    request: SolvencyProofRequest, 
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """Verify a ZK Proof of Solvency via on-chain smart contract"""
    
    # 1. Verify the proof via the ZK Service (calls Blockchain)
    is_valid = await zk_verifier.verify_solvency_proof(
        request.proof, 
        request.public_signals
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Zero-Knowledge Proof is invalid. The balance does not meet the threshold."
        )
    
    # 2. Save the verification record to the database
    verification_id = str(uuid.uuid4())
    verification_doc = DBUserVerification(
        id=verification_id,
        user_id=current_user["user_id"],
        method="ZK-Solvency",
        provider="BlackIntelliSense-Core",
        proof_hash=f"zkp_{uuid.uuid4().hex[:12]}",
        verified_data={
            "status": "solvent",
            "threshold": request.public_signals[1] if len(request.public_signals) > 1 else "unknown",
            "verified_at": datetime.now(timezone.utc).isoformat()
        },
        status="verified",
        created_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        is_heartbeat_active=True,
        last_heartbeat_at=datetime.now(timezone.utc)
    )
    
    db.add(verification_doc)
    await db.commit()

    # Record in heartbeat service
    await heartbeat_service.record_successful_heartbeat(db, current_user["user_id"])
    
    return {
        "message": "Solvency verified successfully!",
        "verification_id": verification_id,
        "status": "verified"
    }

@router.post("/identity/verify")
async def verify_identity(
    request: IdentityProofRequest, 
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    """Verify a ZK Proof of Identity via on-chain smart contract"""
    
    # 1. Verify the proof via the ZK Service (calls Blockchain)
    is_valid = await zk_verifier.verify_identity_proof(
        request.proof, 
        request.public_signals
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Zero-Knowledge Proof is invalid. Identity commitment mismatch."
        )
    
    # 2. Save the verification record to the database
    verification_id = str(uuid.uuid4())
    verification_doc = DBUserVerification(
        id=verification_id,
        user_id=current_user["user_id"],
        method="ZK-Identity",
        provider="BlackIntelliSense-Core",
        proof_hash=f"zkp_{uuid.uuid4().hex[:12]}",
        verified_data={
            "status": "identity_verified",
            "commitment": request.public_signals[0] if request.public_signals else "unknown",
            "verified_at": datetime.now(timezone.utc).isoformat()
        },
        status="verified",
        created_at=datetime.now(timezone.utc),
        expires_at=datetime.now(timezone.utc) + timedelta(days=365) # ID valid for 1 year
    )
    
    db.add(verification_doc)
    await db.commit()
    
    return {
        "message": "Identity verified successfully!",
        "verification_id": verification_id,
        "status": "verified"
    }

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

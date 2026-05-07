from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database import get_db
from typing import Optional
from utils.heartbeat_service import heartbeat_service

router = APIRouter()

# Use a secret key to prevent public spamming of the heartbeat
# In production, this should be in .env as SYSTEM_HEARTBEAT_KEY
HEARTBEAT_KEY = "heartbeat_secret_99"

@router.get("/heartbeat")
async def db_heartbeat(
    x_heartbeat_key: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Keep-alive endpoint to prevent Neon DB from suspending (Autoscale to Zero).
    Executes a lightweight query every few minutes via Vercel Cron.
    """
    if x_heartbeat_key != HEARTBEAT_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid heartbeat key"
        )
    
    try:
        # Simple lightweight query to keep the instance awake
        await db.execute(text("SELECT 1"))
        return {"status": "awake", "message": "Database heartbeat successful"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Heartbeat failed: {str(e)}"
        )

@router.post("/solvency-heartbeat/check")
async def trigger_solvency_heartbeat(
    x_system_key: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger the Automated Solvency Heartbeat check.
    Flag users who missed their periodic zkTLS verification.
    """
    if x_system_key != HEARTBEAT_KEY: # Using same key for simplicity in demo
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized system call"
        )
    
    result = await heartbeat_service.check_and_flag_users(db)
    return {
        "status": "success",
        "details": result
    }

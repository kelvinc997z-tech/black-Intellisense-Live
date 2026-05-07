import os
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from models import DBUserVerification, DBUser

class SolvencyHeartbeatService:
    def __init__(self, heartbeat_interval_days=7):
        self.interval = timedelta(days=heartbeat_interval_days)

    async def check_and_flag_users(self, db: AsyncSession):
        """
        Scans for users who have missed their solvency heartbeat.
        """
        now = datetime.now(timezone.utc)
        threshold = now - self.interval
        
        # Find verifications that are active but haven't been updated since the threshold
        result = await db.execute(
            select(DBUserVerification).where(
                DBUserVerification.is_heartbeat_active == True,
                (DBUserVerification.last_heartbeat_at == None) | 
                (DBUserVerification.last_heartbeat_at < threshold)
            )
        )
        expired_verifications = result.scalars().all()
        
        flagged_count = 0
        for v in expired_verifications:
            # Mark as expired/pending
            v.status = "expired"
            # Optionally: Update the user's role or trust level here
            flagged_count += 1
        
        if flagged_count > 0:
            await db.commit()
            
        return {
            "scanned_at": now.isoformat(),
            "flagged_count": flagged_count,
            "expired_user_ids": [v.user_id for v in expired_verifications]
        }

    async def record_successful_heartbeat(self, db: AsyncSession, user_id: str):
        """
        Update the last heartbeat timestamp after a successful zkTLS proof.
        """
        result = await db.execute(
            select(DBUserVerification).where(
                DBUserVerification.user_id == user_id,
                DBUserVerification.method == "ZK-Solvency"
            )
        )
        v = result.scalar_one_or_none()
        
        if v:
            v.last_heartbeat_at = datetime.now(timezone.utc)
            v.status = "verified"
            v.is_heartbeat_active = True # Ensure it's active for next cycle
            await db.commit()
            return True
        return False

# Singleton
heartbeat_service = SolvencyHeartbeatService()

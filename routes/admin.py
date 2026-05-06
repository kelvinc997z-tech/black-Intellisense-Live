from fastapi import APIRouter, HTTPException, Depends, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, Base
from database import get_db
from typing import Optional

router = APIRouter()

# In production, move this to .env
ADMIN_SYNC_KEY = "sync_secret_99"

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

@router.post("/force-admin")
async def force_admin(
    email: str,
    x_admin_key: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Force change a user's role to ADMIN.
    Use this to fix 'Accept Order' failures caused by incorrect roles.
    """
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
        "user": map_db_user_to_pydantic(user) if 'map_db_user_to_pydantic' in globals() else user.id
    }

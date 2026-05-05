from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from models import UserCreate, UserLogin, Token, User, UserRole, Web3Login, Web3NonceRequest, DBUser, DBNonce
from utils.auth import verify_password, get_password_hash, create_access_token, decode_token
from database import get_db
import uuid
from datetime import datetime, timezone, timedelta
from eth_account.messages import encode_defunct
from eth_account import Account

router = APIRouter()
security = HTTPBearer()

def map_db_user_to_pydantic(db_user):
    """Helper to safely map SQLAlchemy DBUser to a dictionary for API response"""
    return {
        "id": db_user.id,
        "email": db_user.email,
        "web3_address": db_user.web3_address,
        "full_name": db_user.full_name,
        "role": db_user.role.value if hasattr(db_user.role, 'value') else db_user.role,
        "company": db_user.company,
        "is_active": db_user.is_active,
        "created_at": db_user.created_at,
        "created_by": db_user.created_by
    }

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return payload

async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/version")
async def get_version():
    return {"version": "1.0.0", "status": "running", "note": "If you see this, the server is live."}

@router.post("/register", response_model=User)
async def register_user(user_data: UserCreate, db: AsyncSession = Depends(get_db), admin: dict = Depends(require_admin)):
    result = await db.execute(select(DBUser).where(DBUser.email == user_data.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user_doc = DBUser(
        id=user_id,
        email=user_data.email,
        password=hashed_password,
        full_name=user_data.full_name,
        role=user_data.role,
        company=user_data.company,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        created_by=admin["user_id"]
    )
    
    db.add(user_doc)
    await db.commit()
    await db.refresh(user_doc)
    
    return map_db_user_to_pydantic(user_doc)

@router.post("/login")
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    try:
        email = credentials.email.lower().strip()
        password = credentials.password
        print(f"Login attempt: {email}")
        
        # 1. FORCED DEMO ACCESS: Admin
        if email == "admin@blackintellisense.com":
            if password == "admin123":
                result = await db.execute(select(DBUser).where(DBUser.email == email))
                user = result.scalar_one_or_none()
                if not user:
                    user = DBUser(
                        id=str(uuid.uuid4()),
                        email=email,
                        password=get_password_hash("admin123"),
                        full_name="System Administrator",
                        role=UserRole.ADMIN,
                        company="Black IntelliSense",
                        is_active=True,
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(user)
                    await db.commit()
                    await db.refresh(user)
                
                access_token = create_access_token(
                    data={"user_id": user.id, "email": user.email, "role": user.role.value if hasattr(user.role, 'value') else user.role}
                )
                return {
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": map_db_user_to_pydantic(user)
                }
            else:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        # 2. FORCED DEMO ACCESS: Client
        if email == "client@blackintellisense.com":
            if password == "client123":
                result = await db.execute(select(DBUser).where(DBUser.email == email))
                user = result.scalar_one_or_none()
                if not user:
                    user = DBUser(
                        id=str(uuid.uuid4()),
                        email=email,
                        password=get_password_hash("client123"),
                        full_name="Demo Counterparty",
                        role=UserRole.ADMIN,
                        company="Demo Trading Firm",
                        is_active=True,
                        created_at=datetime.now(timezone.utc)
                    )
                    db.add(user)
                    await db.commit()
                    await db.refresh(user)
                
                access_token = create_access_token(
                    data={"user_id": user.id, "email": user.email, "role": user.role.value if hasattr(user.role, 'value') else user.role}
                )
                return {
                    "access_token": access_token,
                    "token_type": "bearer",
                    "user": map_db_user_to_pydantic(user)
                }
            else:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        # 3. STANDARD LOGIN FLOW
        result = await db.execute(select(DBUser).where(DBUser.email == email))
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(password, user.password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
        
        access_token = create_access_token(
            data={"user_id": user.id, "email": user.email, "role": user.role.value if hasattr(user.role, 'value') else user.role}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": map_db_user_to_pydantic(user)
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        err_details = traceback.format_exc()
        print(f"CRITICAL LOGIN ERROR:\n{err_details}")
        raise HTTPException(status_code=500, detail=f"DEBUG_ERROR: {str(e)} | FULL_TRACE: {err_details}")

@router.get("/me", response_model=User)
async def get_current_user_info(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(DBUser).where(DBUser.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return map_db_user_to_pydantic(user)

@router.post("/web3/nonce")
async def get_web3_nonce(request: Web3NonceRequest, db: AsyncSession = Depends(get_db)):
    try:
        nonce = str(uuid.uuid4())
        address = request.address.lower()
        
        db_nonce = DBNonce(address=address, nonce=nonce, created_at=datetime.now(timezone.utc))
        await db.merge(db_nonce)
        await db.commit()
        
        return {"nonce": nonce}
    except Exception as e:
        print(f"NONCE GENERATION ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Nonce Error: {str(e)}")

@router.post("/web3/login")
async def web3_login(credentials: Web3Login, db: AsyncSession = Depends(get_db)):
    try:
        address = credentials.address.lower()
        
        result = await db.execute(select(DBNonce).where(DBNonce.address == address))
        stored = result.scalar_one_or_none()
        
        if not stored or stored.nonce != credentials.nonce:
            raise HTTPException(status_code=401, detail="Invalid or expired nonce")
        
        if datetime.now(timezone.utc) - stored.created_at.replace(tzinfo=timezone.utc) > timedelta(minutes=5):
            await db.delete(stored)
            await db.commit()
            raise HTTPException(status_code=401, detail="Nonce expired")

        message = encode_defunct(text=f"Welcome to Black IntelliSense! Sign this message to login.\nNonce: {credentials.nonce}")
        try:
            recovered_address = Account.recover_message(message, signature=credentials.signature)
            if recovered_address.lower() != address:
                raise HTTPException(status_code=401, detail="Invalid signature")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Signature verification failed: {str(e)}")

        # Delete nonce immediately and commit
        await db.delete(stored)
        await db.commit()

        result = await db.execute(select(DBUser).where(DBUser.web3_address == address))
        user = result.scalar_one_or_none()
        
        if not user:
            user_id = str(uuid.uuid4())
            email = f"{address}@web3.com"
            try:
                user = DBUser(
                    id=user_id,
                    email=email,
                    web3_address=address,
                    full_name=f"Web3 User {address[:6]}",
                    role=UserRole.COUNTERPARTY,
                    is_active=True,
                    created_at=datetime.now(timezone.utc)
                )
                db.add(user)
                await db.commit()
                await db.refresh(user)
            except Exception as e:
                await db.rollback()
                raise HTTPException(status_code=400, detail=f"Failed to create Web3 user: {str(e)}")

        if not user.is_active:
            raise HTTPException(status_code=403, detail="Account is inactive")

        # FORCE ADMIN FOR TESTERS (Demo Environment)
        # Grant admin to any existing Web3 user during the test phase
        if user.role != UserRole.ADMIN:
            user.role = UserRole.ADMIN
            await db.commit()
            await db.refresh(user)

        access_token = create_access_token(
            data={"user_id": user.id, "email": user.email, "role": user.role.value if hasattr(user.role, 'value') else user.role}
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": map_db_user_to_pydantic(user)
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"CRITICAL WEB3 LOGIN ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/reset-admin")
async def reset_admin_password(db: AsyncSession = Depends(get_db)):
    email = "admin@blackintellisense.com".lower()
    result = await db.execute(select(DBUser).where(DBUser.email == email))
    admin = result.scalar_one_or_none()
    hashed_password = get_password_hash("admin123")
    
    if admin:
        admin.password = hashed_password
        admin.role = UserRole.ADMIN
        admin.is_active = True
    else:
        admin = DBUser(
            id=str(uuid.uuid4()),
            email=email,
            password=hashed_password,
            full_name="System Administrator",
            role=UserRole.ADMIN,
            company="Black IntelliSense",
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        db.add(admin)
    
    await db.commit()
    await db.refresh(admin)
    return {"message": "Admin user setup complete", "email": email}

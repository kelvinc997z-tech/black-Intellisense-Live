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
    
    return user_doc

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    print(f"Login attempt for email: {credentials.email}")
    result = await db.execute(select(DBUser).where(DBUser.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user:
        print(f"Login failed: User {credentials.email} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(credentials.password, user.password):
        print(f"Login failed: Incorrect password for {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        print(f"Login failed: Account {credentials.email} is inactive")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    print(f"Login successful for: {credentials.email}")
    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role.value}
    )
    
    return Token(access_token=access_token, user=User.model_validate(user))

@router.get("/me", response_model=User)
async def get_current_user_info(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(select(DBUser).where(DBUser.id == current_user["user_id"]))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User.model_validate(user)

@router.post("/web3/nonce")
async def get_web3_nonce(request: Web3NonceRequest, db: AsyncSession = Depends(get_db)):
    nonce = str(uuid.uuid4())
    address = request.address.lower()
    
    db_nonce = DBNonce(address=address, nonce=nonce, created_at=datetime.now(timezone.utc))
    await db.merge(db_nonce)
    await db.commit()
    
    return {"nonce": nonce}

@router.post("/web3/login", response_model=Token)
async def web3_login(credentials: Web3Login, db: AsyncSession = Depends(get_db)):
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
    except Exception:
        raise HTTPException(status_code=401, detail="Signature verification failed")

    await db.delete(stored)

    result = await db.execute(select(DBUser).where(DBUser.web3_address == address))
    user = result.scalar_one_or_none()
    
    if not user:
        user_id = str(uuid.uuid4())
        user = DBUser(
            id=user_id,
            email=f"{address[:10]}@web3.com",
            web3_address=address,
            full_name=f"Web3 User {address[:6]}",
            role=UserRole.COUNTERPARTY,
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    access_token = create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role.value}
    )
    
    return Token(access_token=access_token, user=User.model_validate(user))

@router.post("/reset-admin")
async def reset_admin_password(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).where(DBUser.email == "admin@blackintellisense.com"))
    admin = result.scalar_one_or_none()
    hashed_password = get_password_hash("admin123")
    
    if admin:
        admin.password = hashed_password
        admin.role = UserRole.ADMIN
        admin.is_active = True
    else:
        admin = DBUser(
            id=str(uuid.uuid4()),
            email="admin@blackintellisense.com",
            password=hashed_password,
            full_name="System Administrator",
            role=UserRole.ADMIN,
            company="Black IntelliSense",
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
        db.add(admin)
    
    await db.commit()
    return {"message": "Admin user setup complete", "email": "admin@blackintellisense.com"}

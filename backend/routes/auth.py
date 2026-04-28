from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models import UserCreate, UserLogin, Token, User, UserRole
from utils.auth import verify_password, get_password_hash, create_access_token, decode_token
import uuid
from datetime import datetime, timezone

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
async def register_user(user_data: UserCreate, admin: dict = Depends(require_admin)):
    from server import get_db
    db = get_db()
    
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password": hashed_password,
        "full_name": user_data.full_name,
        "role": user_data.role,
        "company": user_data.company,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": admin["user_id"]
    }
    
    await db.users.insert_one(user_doc)
    
    return User(
        id=user_id,
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role,
        company=user_data.company,
        is_active=True,
        created_at=datetime.now(timezone.utc),
        created_by=admin["user_id"]
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    from server import get_db
    db = get_db()
    
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )
    
    access_token = create_access_token(
        data={"user_id": user["id"], "email": user["email"], "role": user["role"]}
    )
    
    user_obj = User(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        company=user.get("company"),
        is_active=user.get("is_active", True),
        created_at=datetime.fromisoformat(user["created_at"]) if isinstance(user["created_at"], str) else user["created_at"]
    )
    
    return Token(access_token=access_token, user=user_obj)

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    user = await db.users.find_one({"id": current_user["user_id"]})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        company=user.get("company"),
        is_active=user.get("is_active", True),
        created_at=datetime.fromisoformat(user["created_at"]) if isinstance(user["created_at"], str) else user["created_at"]
    )

@router.post("/create-admin")
async def create_initial_admin():
    from server import get_db
    db = get_db()
    
    existing_admin = await db.users.find_one({"role": "admin"})
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin already exists. Use /register with admin token."
        )
    
    admin_id = str(uuid.uuid4())
    hashed_password = get_password_hash("admin123")
    
    admin_doc = {
        "id": admin_id,
        "email": "admin@blackintellisense.com",
        "password": hashed_password,
        "full_name": "System Administrator",
        "role": "admin",
        "company": "Black IntelliSense",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(admin_doc)
    
    return {"message": "Admin created successfully", "email": "admin@blackintellisense.com", "password": "admin123"}

@router.post("/reset-admin")
async def reset_admin_password():
    """
    Development helper: ensures the default admin exists with password 'admin123'.
    If an admin already exists, its password is reset to 'admin123'.
    """
    from server import get_db
    db = get_db()
    
    admin = await db.users.find_one({"email": "admin@blackintellisense.com"})
    hashed_password = get_password_hash("admin123")
    
    if admin:
        await db.users.update_one(
            {"email": "admin@blackintellisense.com"},
            {
                "$set": {
                    "password": hashed_password,
                    "role": "admin",
                    "is_active": True
                }
            }
        )
        return {"message": "Admin password reset", "email": "admin@blackintellisense.com"}
    else:
        admin_id = str(uuid.uuid4())
        admin_doc = {
            "id": admin_id,
            "email": "admin@blackintellisense.com",
            "password": hashed_password,
            "full_name": "System Administrator",
            "role": "admin",
            "company": "Black IntelliSense",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_doc)
        return {"message": "Admin created", "email": "admin@blackintellisense.com"}

@router.post("/reset-client")
async def reset_client_user():
    """
    Development helper: ensures a market maker client exists with email client@blackintellisense.com
    and password 'client123'. If exists, password and role are enforced.
    """
    from server import get_db
    db = get_db()
    
    client = await db.users.find_one({"email": "client@blackintellisense.com"})
    hashed_password = get_password_hash("client123")
    
    if client:
        await db.users.update_one(
            {"email": "client@blackintellisense.com"},
            {
                "$set": {
                    "password": hashed_password,
                    "role": "market_maker",
                    "is_active": True
                }
            }
        )
        return {"message": "Client user reset", "email": "client@blackintellisense.com"}
    else:
        client_id = str(uuid.uuid4())
        client_doc = {
            "id": client_id,
            "email": "client@blackintellisense.com",
            "password": hashed_password,
            "full_name": "Client Market Maker",
            "role": "market_maker",
            "company": "Black IntelliSense",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(client_doc)
        return {"message": "Client user created", "email": "client@blackintellisense.com"}

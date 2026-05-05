from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from typing import Optional
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

import hashlib

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Use SHA-256 pre-hashing to bypass bcrypt's 72-byte limit
    pre_hashed = hashlib.sha256(plain_password.encode()).hexdigest()
    return pwd_context.verify(pre_hashed, hashed_password)

def get_password_hash(password: str) -> str:
    # Use SHA-256 pre-hashing to bypass bcrypt's 72-byte limit
    pre_hashed = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(pre_hashed)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

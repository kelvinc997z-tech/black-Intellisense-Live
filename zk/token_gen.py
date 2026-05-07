from jose import jwt
from datetime import datetime, timezone, timedelta
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"

def create_test_token(user_id="test_user", role="admin"):
    expire = datetime.now(timezone.utc) + timedelta(days=1)
    to_encode = {"user_id": user_id, "email": "test@example.com", "role": role, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

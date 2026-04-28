import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

# Priority: POSTGRES_URL (Vercel), then DATABASE_URL, then local default
raw_url = os.environ.get("POSTGRES_URL") or os.environ.get("DATABASE_URL") or "postgresql+asyncpg://postgres:password@localhost/dbname"

DATABASE_URL = raw_url

# Vercel Postgres usually provides POSTGRES_URL, but we need to ensure it uses asyncpg driver
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# asyncpg uses ssl=require instead of sslmode=require
if "sslmode=require" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("sslmode=require", "ssl=require")

# For Neon, we often need to ensure the SSL context is correct for asyncpg
# But usually the URL param is enough.

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with SessionLocal() as session:
        yield session

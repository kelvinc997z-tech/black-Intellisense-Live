import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

# Priority: POSTGRES_URL (Vercel), then DATABASE_URL, then local default
raw_url = os.environ.get("POSTGRES_URL") or os.environ.get("DATABASE_URL") or "postgresql://postgres:password@localhost/dbname"

DATABASE_URL = raw_url

# Use psycopg (v3) for better stability in Vercel/Neon environments
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg://", 1)

# Remove manual sslmode appending. 
# Neon connection strings usually already include necessary SSL params.
# Psycopg 3 handles sslmode=require by default if not specified for most cloud providers.

engine = create_async_engine(
    DATABASE_URL, 
    echo=False,
    pool_pre_ping=True,
    pool_recycle=3600
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with SessionLocal() as session:
        yield session

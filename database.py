import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv
import asyncpg

load_dotenv()

# Priority: POSTGRES_URL (Vercel), then DATABASE_URL, then local default
raw_url = os.environ.get("POSTGRES_URL") or os.environ.get("DATABASE_URL") or "postgresql+asyncpg://postgres:password@localhost/dbname"

DATABASE_URL = raw_url

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

if "sslmode=require" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("sslmode=require", "ssl=require")

async def get_async_connection():
    """
    Custom connection creator to bypass 'channel_binding' error.
    Ensures we use asyncpg directly to avoid SQLAlchemy injecting unsupported args.
    """
    # Extract the pure postgres URL (remove the driver prefix)
    pure_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    
    # Establish connection using asyncpg directly
    conn = await asyncpg.connect(pure_url)
    return conn

# Use the custom creator to avoid the 'channel_binding' keyword argument error
engine = create_async_engine(
    DATABASE_URL, 
    echo=True,
    creator=get_async_connection
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with SessionLocal() as session:
        yield session

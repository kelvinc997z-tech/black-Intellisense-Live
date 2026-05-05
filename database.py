import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv

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

# Use connect_args to handle SSL and avoid the 'channel_binding' error
# By explicitly setting the connection parameters here, we bypass the problematic defaults
engine = create_async_engine(
    DATABASE_URL, 
    echo=True,
    connect_args={
        "ssl": "require",
        "command_timeout": 60,
    }
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with SessionLocal() as session:
        yield session

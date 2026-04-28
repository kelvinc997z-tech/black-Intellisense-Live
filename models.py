from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import Column, String, Boolean, DateTime, Float, JSON, ForeignKey, Enum as SQLEnum, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base

# --- Enums ---
class UserRole(str, Enum):
    ADMIN = "admin"
    MARKET_MAKER = "market_maker"
    COUNTERPARTY = "counterparty"
    MERCHANT = "merchant"

class ExchangeType(str, Enum):
    BINANCE = "binance"
    OKEX = "okex"
    HUOBI = "huobi"

class WalletType(str, Enum):
    WEB3 = "web3"
    INTERNAL = "internal"

class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"

class OrderStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    FILLED = "filled"
    CANCELLED = "cancelled"
    PARTIAL = "partial"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    UPLOADED = "uploaded"
    VERIFIED = "verified"
    REJECTED = "rejected"

class SettlementStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    COMPLETED = "completed"
    REJECTED = "rejected"

# --- SQLAlchemy Models ---

class DBUser(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    web3_address: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True, nullable=True)
    full_name: Mapped[str] = mapped_column(String)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole))
    company: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)

class DBNonce(Base):
    __tablename__ = "nonces"
    address: Mapped[str] = mapped_column(String, primary_key=True)
    nonce: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBExchangeConnection(Base):
    __tablename__ = "exchange_connections"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    exchange: Mapped[ExchangeType] = mapped_column(SQLEnum(ExchangeType))
    api_key: Mapped[str] = mapped_column(String)
    api_secret: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBWallet(Base):
    __tablename__ = "wallets"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    wallet_type: Mapped[WalletType] = mapped_column(SQLEnum(WalletType))
    address: Mapped[str] = mapped_column(String)
    label: Mapped[str] = mapped_column(String)
    balance: Mapped[Dict[str, float]] = mapped_column(JSON) # e.g. {"USDT": 1000.0}
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBMarkupConfig(Base):
    __tablename__ = "markup_configs"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), unique=True)
    fixed_markup: Mapped[float] = mapped_column(Float, default=0.5)
    percentage_markup: Mapped[float] = mapped_column(Float, default=1.2)
    tiered_markup: Mapped[Dict[str, float]] = mapped_column(JSON)
    min_trade_size: Mapped[float] = mapped_column(Float, default=1000.0)
    max_trade_size: Mapped[float] = mapped_column(Float, default=100000.0)
    max_slippage: Mapped[float] = mapped_column(Float, default=0.3)
    auto_threshold: Mapped[float] = mapped_column(Float, default=50000.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBOrder(Base):
    __tablename__ = "orders"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    symbol: Mapped[str] = mapped_column(String)
    side: Mapped[OrderSide] = mapped_column(SQLEnum(OrderSide))
    amount: Mapped[float] = mapped_column(Float)
    price: Mapped[float] = mapped_column(Float)
    total: Mapped[float] = mapped_column(Float)
    status: Mapped[OrderStatus] = mapped_column(SQLEnum(OrderStatus), default=OrderStatus.PENDING)
    filled_amount: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    accepted_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    accepted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    rejected_by: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    rejected_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(String, nullable=True)

class DBTrade(Base):
    __tablename__ = "trades"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    order_id: Mapped[str] = mapped_column(String, ForeignKey("orders.id"))
    buyer_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    seller_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    symbol: Mapped[str] = mapped_column(String)
    amount: Mapped[float] = mapped_column(Float)
    price: Mapped[float] = mapped_column(Float)
    total: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String, default="pending_payment")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBPaymentProof(Base):
    __tablename__ = "payment_proofs"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    trade_id: Mapped[str] = mapped_column(String, ForeignKey("trades.id"))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    file_name: Mapped[str] = mapped_column(String)
    file_url: Mapped[str] = mapped_column(String)
    ocr_data: Mapped[Dict[str, Any]] = mapped_column(JSON)
    status: Mapped[PaymentStatus] = mapped_column(SQLEnum(PaymentStatus), default=PaymentStatus.UPLOADED)
    reference_code: Mapped[str] = mapped_column(String)
    amount: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBSettlement(Base):
    __tablename__ = "settlements"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    trade_id: Mapped[str] = mapped_column(String, ForeignKey("trades.id"))
    order_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("orders.id"), nullable=True)
    counterparty_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    payment_proof_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("payment_proofs.id"), nullable=True)
    status: Mapped[SettlementStatus] = mapped_column(SQLEnum(SettlementStatus), default=SettlementStatus.PENDING)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    approved_by: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBChatMessage(Base):
    __tablename__ = "chat_messages"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    trade_id: Mapped[str] = mapped_column(String, ForeignKey("trades.id"))
    sender_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    receiver_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    message: Mapped[str] = mapped_column(String)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBAsset(Base):
    __tablename__ = "assets"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    symbol: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    balance: Mapped[float] = mapped_column(Float, default=0.0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBExchangeAPIConfig(Base):
    __tablename__ = "exchange_api_configs"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    exchange: Mapped[str] = mapped_column(String)
    api_key: Mapped[str] = mapped_column(String)
    api_secret: Mapped[str] = mapped_column(String)
    is_live: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

class DBP2PMerchantPrice(Base):
    __tablename__ = "p2p_merchant_prices"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    merchant_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"))
    merchant_name: Mapped[str] = mapped_column(String)
    symbol: Mapped[str] = mapped_column(String)
    buy_price: Mapped[float] = mapped_column(Float)
    sell_price: Mapped[float] = mapped_column(Float)
    min_amount: Mapped[float] = mapped_column(Float)
    max_amount: Mapped[float] = mapped_column(Float)
    payment_methods: Mapped[List[str]] = mapped_column(JSON)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

# --- Pydantic Models (for API) ---

class User(BaseModel):
    model_config = ConfigDict(extra="ignore", from_attributes=True)
    id: str
    email: Optional[EmailStr] = None
    web3_address: Optional[str] = None
    full_name: str
    role: UserRole
    company: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole
    company: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Web3Login(BaseModel):
    address: str
    signature: str
    nonce: str

class Web3NonceRequest(BaseModel):
    address: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class ExchangeConnection(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    exchange: ExchangeType
    api_key: str
    api_secret: str
    is_active: bool
    is_demo: bool
    created_at: datetime

class ExchangeConnectionCreate(BaseModel):
    exchange: ExchangeType
    api_key: str
    api_secret: str
    is_demo: bool = False

class Wallet(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    wallet_type: WalletType
    address: str
    label: str
    balance: Dict[str, float]
    created_at: datetime

class WalletCreate(BaseModel):
    wallet_type: WalletType
    address: str
    label: str

class MarkupConfig(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    fixed_markup: float
    percentage_markup: float
    tiered_markup: Dict[str, float]
    min_trade_size: float
    max_trade_size: float
    max_slippage: float
    auto_threshold: float
    updated_at: datetime

class MarkupConfigUpdate(BaseModel):
    fixed_markup: Optional[float] = None
    percentage_markup: Optional[float] = None
    tiered_markup: Optional[Dict[str, float]] = None
    min_trade_size: Optional[float] = None
    max_trade_size: Optional[float] = None
    max_slippage: Optional[float] = None
    auto_threshold: Optional[float] = None

class PriceFeed(BaseModel):
    id: str
    exchange: ExchangeType
    symbol: str
    bid_price: float
    ask_price: float
    spread: float
    volume_24h: float
    timestamp: datetime

class Order(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    symbol: str
    side: OrderSide
    amount: float
    price: float
    total: float
    status: OrderStatus
    filled_amount: float
    created_at: datetime
    updated_at: datetime
    accepted_by: Optional[str] = None
    accepted_at: Optional[datetime] = None
    rejected_by: Optional[str] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

class OrderCreate(BaseModel):
    symbol: str
    side: OrderSide
    amount: float
    price: float

class Trade(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    order_id: str
    buyer_id: str
    seller_id: str
    symbol: str
    amount: float
    price: float
    total: float
    status: str
    created_at: datetime

class PaymentProof(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    trade_id: str
    user_id: str
    file_name: str
    file_url: str
    ocr_data: Dict[str, Any]
    status: PaymentStatus
    reference_code: str
    amount: float
    created_at: datetime

class Settlement(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    trade_id: str
    order_id: Optional[str] = None
    counterparty_id: Optional[str] = None
    payment_proof_id: Optional[str] = None
    status: SettlementStatus
    amount: float
    notes: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    trade_symbol: Optional[str] = None
    trade_amount: Optional[float] = None
    reference_code: Optional[str] = None

class SettlementUpdate(BaseModel):
    status: SettlementStatus
    notes: Optional[str] = None

class ChatMessage(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    trade_id: str
    sender_id: str
    receiver_id: str
    message: str
    is_read: bool
    created_at: datetime

class ChatMessageCreate(BaseModel):
    trade_id: str
    receiver_id: str
    message: str

class Asset(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    symbol: str
    name: str
    balance: float
    is_visible: bool
    created_at: datetime

class AssetCreate(BaseModel):
    symbol: str
    name: str
    balance: float
    is_visible: bool = True

class AssetVisibilityUpdate(BaseModel):
    is_visible: bool

class OrderBookEntry(BaseModel):
    price: float
    amount: float
    total: float

class OrderBook(BaseModel):
    exchange: str
    symbol: str
    bids: List[OrderBookEntry]
    asks: List[OrderBookEntry]

class ExchangeAPIConfig(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    exchange: str
    api_key: str
    api_secret: str
    is_live: bool
    is_active: bool
    created_at: datetime

class P2PMerchantPrice(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    merchant_id: str
    merchant_name: str
    symbol: str
    buy_price: float
    sell_price: float
    min_amount: float
    max_amount: float
    payment_methods: List[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

class P2PMerchantPriceCreate(BaseModel):
    symbol: str
    buy_price: float
    sell_price: float
    min_amount: float
    max_amount: float
    payment_methods: List[str]

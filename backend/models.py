from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from enum import Enum

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

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
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
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    exchange: ExchangeType
    api_key: str
    api_secret: str
    is_active: bool = True
    is_demo: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExchangeConnectionCreate(BaseModel):
    exchange: ExchangeType
    api_key: str
    api_secret: str
    is_demo: bool = True

class Wallet(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    wallet_type: WalletType
    address: str
    label: Optional[str] = None
    balance: Dict[str, float] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WalletCreate(BaseModel):
    wallet_type: WalletType
    address: str
    label: Optional[str] = None

class MarkupConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    fixed_markup: float = 0.5
    percentage_markup: float = 1.2
    tiered_markup: Dict[str, float] = Field(default_factory=dict)
    min_trade_size: float = 1000.0
    max_trade_size: float = 100000.0
    max_slippage: float = 0.3
    auto_threshold: float = 50000.0
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MarkupConfigUpdate(BaseModel):
    fixed_markup: Optional[float] = None
    percentage_markup: Optional[float] = None
    tiered_markup: Optional[Dict[str, float]] = None
    min_trade_size: Optional[float] = None
    max_trade_size: Optional[float] = None
    max_slippage: Optional[float] = None
    auto_threshold: Optional[float] = None

class PriceFeed(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    exchange: ExchangeType
    symbol: str
    bid_price: float
    ask_price: float
    spread: float
    volume_24h: float
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    symbol: str
    side: OrderSide
    amount: float
    price: float
    total: float
    status: OrderStatus = OrderStatus.PENDING
    filled_amount: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    symbol: str
    side: OrderSide
    amount: float
    price: float

class Trade(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    order_id: str
    buyer_id: str
    seller_id: str
    symbol: str
    amount: float
    price: float
    total: float
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    trade_id: str
    sender_id: str
    receiver_id: str
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessageCreate(BaseModel):
    trade_id: str
    receiver_id: str
    message: str

class PaymentProof(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    trade_id: str
    user_id: str
    file_name: str
    file_url: str
    ocr_data: Optional[Dict[str, Any]] = None
    status: PaymentStatus = PaymentStatus.UPLOADED
    reference_code: Optional[str] = None
    amount: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Settlement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    trade_id: str
    payment_proof_id: str
    status: SettlementStatus = SettlementStatus.PENDING
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SettlementUpdate(BaseModel):
    status: SettlementStatus
    notes: Optional[str] = None

class ExchangeAPIConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    exchange: ExchangeType
    api_key: str
    api_secret: str
    is_live: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderBookEntry(BaseModel):
    price: float
    amount: float
    total: float

class OrderBook(BaseModel):
    exchange: str
    symbol: str
    bids: List[OrderBookEntry]
    asks: List[OrderBookEntry]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class P2PMerchantPrice(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    merchant_id: str
    merchant_name: str
    symbol: str
    buy_price: float
    sell_price: float
    min_amount: float
    max_amount: float
    payment_methods: List[str]
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class P2PMerchantPriceCreate(BaseModel):
    symbol: str
    buy_price: float
    sell_price: float
    min_amount: float
    max_amount: float
    payment_methods: List[str]

class Asset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    symbol: str
    name: str
    balance: float
    is_visible: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AssetCreate(BaseModel):
    symbol: str
    name: str
    balance: float
    is_visible: bool = True

class AssetVisibilityUpdate(BaseModel):
    is_visible: bool


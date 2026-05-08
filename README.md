# 🌑 Black IntelliSense

Black IntelliSense is a professional-grade, multi-platform trading infrastructure designed for institutional dark pools and OTC (Over-The-Counter) trading. It provides a centralized backend to manage liquidity, pricing, and order execution across different user roles.

## 🏗️ Architecture

The system is split into three primary platforms:

1. **Centralized Backend API**: The core engine handling authentication, exchange connectivity, order matching, and settlement.
2. **Sense50 (Admin Panel)**: A high-performance dashboard for Market Makers and Admins to configure markups, manage API keys, and accept/reject counterparty orders.
3. **IntelliTrade (Counterparty Panel)**: A streamlined interface for clients to place OTC orders, track their portfolio, and communicate via secure chat.

## 🛠️ Tech Stack

- **Backend**: `FastAPI` (Python 3.12), `SQLAlchemy` (Async), `PostgreSQL` (Neon DB).
- **Frontend**: `React`, `Tailwind CSS`, `Lucide React` (Icons), `Axios`.
- **Auth**: `JWT` (JSON Web Tokens), `Bcrypt` (Password Hashing), `Web3/MetaMask` (Digital Signatures).
- **Deployment**: `Vercel` (Serverless Functions), `Neon` (Serverless Postgres).

## 🚀 Key Updates & Fixes

### 🛡️ Security & Authentication
- **Bcrypt 72-byte Bypass**: Implemented **SHA-256 pre-hashing** to ensure passwords of any length can be securely hashed without triggering the bcrypt character limit.
- **Web3 Integration**: Added seamless MetaMask login with an automated role-promotion system for authorized testers.
- **Session Management**: Optimized JWT token lifecycle and secure storage.

### 📈 Order Management
- **Full Lifecycle Flow**: Implemented the complete order flow: `Pending` $\rightarrow$ `Accepted` (creates Trade & Settlement) or `Rejected`.
- **Admin Control**: Real-time order monitoring for Market Makers to manage liquidity requests efficiently.

### ⚡ Performance & Stability
- **Cold Start Optimization**: Refactored the FastAPI `lifespan` event to prevent Vercel serverless timeouts (500 errors) during initialization.
- **Frontend Resilience**: Added safe-array guards across all data-mapping components to eliminate "blank screen" crashes caused by API errors.
- **Routing Fixes**: Corrected navigation paths for the Order Management system.

### 💸 Internal Fiat Gateway & zkTLS Verification
The system has migrated from third-party providers (MoonPay) to a private, internal settlement system to ensure maximum privacy and control.

#### 🔄 Workflow
**1. Fiat Deposit (On-Ramp: Fiat $\rightarrow$ USDT)**
- **Transfer**: User transfers fiat to the official SENSE 50 institutional bank account.
- **Verification**: User utilizes **zkTLS (via Reclaim Protocol)** to provide a cryptographic proof of the bank transfer.
- **Settlement**: Upon zkTLS confirmation, the system credits USDT to the user's wallet.

**2. Fiat Withdrawal (Off-Ramp: USDT $\rightarrow$ Fiat)**
- **USDT Transfer**: User sends USDT to the SENSE 50 secure vault.
- **Verification**: User provides **zkTLS proof** that the on-chain transaction was successfully sent to the institutional address.
- **Settlement**: SENSE 50 processes the fiat transfer to the user's verified bank account.

#### 🛡️ Key Features
- **Bank Management**: Secure storage and verification of user's bank account details.
- **Privacy-Preserving**: zkTLS ensures that only the necessary transaction data is verified without exposing sensitive account credentials.
- **Direct Settlement**: Eliminates third-party fees and delays by acting as the direct counterparty.

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@blackintellisense.com` | `admin123` |
| **Client** | `client@blackintellisense.com` | `client123` |

## 🛠️ Installation & Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
# Set up .env with POSTGRES_URL and JWT_SECRET_KEY
python server.py
```

### Frontend
```bash
# Sense50 Admin
cd frontend
yarn install
yarn start

# IntelliTrade Client
cd intellitrade-frontend
yarn install
yarn start
```

---
© 2026 Black IntelliSense. All rights reserved.

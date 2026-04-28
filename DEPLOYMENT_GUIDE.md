# Black IntelliSense - Multi-Platform Architecture Deployment Guide

## System Overview

Black IntelliSense is now a **3-platform architecture** with:

1. **Centralized Backend API** (Port 8001)
2. **Sense50 Admin Frontend** (Port 3000)
3. **IntelliTrade Counterparty Frontend** (Port 3001)

---

## Platform 1: Centralized Backend (FastAPI)

### Location
`/app/backend/`

### Features
- All API endpoints for both frontends
- User authentication (JWT)
- Exchange API integration (Binance, OKEx, Huobi)
- API Trade Module (order book management)
- P2P Trading system
- Wallet management
- Markup configuration
- Price aggregation
- Order & trade management
- Chat system
- Payment proof processing with OCR
- Settlement workflow
- Asset visibility controls
- Report exports (CSV, Excel, PDF)

### Key Endpoints
- `/api/auth/*` - Authentication
- `/api/api-trade/*` - API Trade Module
- `/api/p2p/*` - P2P Trading
- `/api/assets/*` - Asset Management
- `/api/prices/*` - Live pricing (real USDT from CoinGecko)
- `/api/orders/*` - Order management
- `/api/trades/*` - Trade execution
- `/api/chat/*` - Messaging
- `/api/payments/*` - Payment proofs
- `/api/settlements/*` - Settlement workflow
- `/api/reports/*` - Export reports

### Running Backend
```bash
cd /app/backend
pip install -r requirements.txt
supervisorctl restart backend
```

---

## Platform 2: Sense50 Admin Frontend (React)

### Location
`/app/frontend/`

### Purpose
Admin/Market Maker control panel

### Pages
1. **Dashboard** - Metrics, charts, activity
2. **API Connections** - Manage exchange APIs
3. **API Trade Module** - Live order book, trading
4. **P2P Trading** - Merchant price management
5. **Wallets** - Connect Web3/Internal wallets
6. **Markup Config** - Pricing rules
7. **Price Feeds** - Multi-exchange aggregation
8. **MarkCRM** - Settlement management with exports

### Running Sense50
```bash
cd /app/frontend
yarn install
supervisorctl restart frontend
```

### Access
- URL: `https://black-intellisense.preview.emergentagent.com`
- Port: 3000
- Login: admin@blackintellisense.com / admin123

---

## Platform 3: IntelliTrade Counterparty Frontend (React)

### Location
`/app/intellitrade-frontend/`

### Purpose
OTC trading platform for counterparties/clients

### Pages
1. **Login** - Counterparty authentication
2. **Trading** - OTC buy/sell interface
3. **Assets** - Show/hide asset visibility
4. **Payment Upload** - Submit payment proofs
5. **Chat** - Negotiate with counterparty

### Running IntelliTrade
```bash
cd /app/intellitrade-frontend
yarn install
yarn start
```

### Configuration
- Port: 3001
- Backend API: Same as Sense50 (centralized)
- Separate authentication tokens

---

## Deployment Architecture

### Option A: Single Server Deployment
```
Server:
├── Backend (Port 8001)
├── Sense50 Frontend (Port 3000)
└── IntelliTrade Frontend (Port 3001)
```

### Option B: Separate Deployment (Recommended for Production)
```
Server 1: Backend API (Port 8001)
Server 2: Sense50 Frontend (Port 3000)
Server 3: IntelliTrade Frontend (Port 3001)
```

---

## Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
JWT_SECRET_KEY=your-secret-key
CORS_ORIGINS=*
```

### Sense50 Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://black-intellisense.preview.emergentagent.com
PORT=3000
```

### IntelliTrade Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://black-intellisense.preview.emergentagent.com
PORT=3001
```

---

## User Roles

1. **Admin** - Full system access (both platforms)
2. **Market Maker** - Sense50 access, price control
3. **Merchant** - P2P price setting
4. **Counterparty** - IntelliTrade access only

---

## Key Features by Platform

### Sense50 (Admin Side)
✅ Dashboard with real-time metrics
✅ Exchange API key configuration
✅ Live order book from exchanges
✅ P2P merchant price management
✅ Wallet connection (Web3 + Internal)
✅ Markup configuration (global)
✅ Price aggregation from multiple sources
✅ MarkCRM with CSV/Excel/PDF export

### IntelliTrade (Client Side)
✅ Live OTC pricing (with markup)
✅ Buy/Sell trading interface
✅ Asset visibility control
✅ Payment proof upload
✅ Chat/negotiation system
✅ Transaction tracking

---

## Testing Credentials

**Admin Account (Sense50):**
- Email: admin@blackintellisense.com
- Password: admin123
- Access: Full system control

**Counterparty Account (IntelliTrade):**
- Same credentials work for demo
- In production: Registered by admin only

---

## Next Steps for Your Dev Team

1. **Exchange API Integration**
   - Add real API keys in Sense50 → API Trade → Configure API
   - Test live order book functionality
   - Enable live trading mode

2. **Deploy IntelliTrade Separately**
   - Build: `cd /app/intellitrade-frontend && yarn build`
   - Deploy build folder to your hosting
   - Update REACT_APP_BACKEND_URL to production API

3. **OCR Enhancement**
   - Current: Mock OCR data
   - Upgrade: Integrate real OCR service (Tesseract configured)

4. **Database Optimization**
   - Add indexes for frequently queried fields
   - Set up MongoDB replica set for production

5. **Security Hardening**
   - Change JWT_SECRET_KEY in production
   - Configure CORS_ORIGINS properly
   - Add rate limiting
   - Enable HTTPS

---

## Architecture Benefits

✅ **Centralized Backend** - Single source of truth
✅ **Separate Frontends** - Independent deployment & scaling
✅ **Role-Based Access** - Admin vs Counterparty separation
✅ **Scalable** - Each platform scales independently
✅ **Maintainable** - Clear separation of concerns

---

## Support

For issues or questions:
- Backend logs: `/var/log/supervisor/backend.*.log`
- Frontend logs: `/var/log/supervisor/frontend.*.log`
- IntelliTrade logs: Check console when running

---

**Built by Black IntelliSense**
Website: https://blackintellisense.com

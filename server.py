from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from database import engine, Base

# Debugging list to catch import errors
import_errors = []

def safe_import_router(name, module_path, prefix, tags):
    try:
        # Dynamically import the module
        import importlib
        module = importlib.import_module(module_path)
        app.include_router(module.router, prefix=prefix, tags=tags)
        return True
    except Exception as e:
        import traceback
        error_msg = f"Error importing {name} ({module_path}): {str(e)}\n{traceback.format_exc()}"
        import_errors.append(error_msg)
        print(error_msg)
        return False

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Database tables are synchronized via /api/admin/sync-db to avoid Vercel cold-start timeouts
    yield
    await engine.dispose()

app = FastAPI(
    title="Black IntelliSense API",
    description="Centralized API for Black IntelliSense Platforms",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Server is alive!"}

@app.get("/api/debug/imports")
async def debug_imports():
    """Endpoint to see which routers failed to load"""
    return {
        "total_errors": len(import_errors),
        "errors": import_errors
    }

# Routes - Loaded safely to prevent total server crash
routes_to_load = [
    ("Authentication", "routes.auth", "/api/auth", ["Authentication"]),
    ("Exchanges", "routes.exchanges", "/api/exchanges", ["Exchanges"]),
    ("Wallets", "routes.wallets", "/api/wallets", ["Wallets"]),
    ("Markup", "routes.markup", "/api/markup", ["Markup"]),
    ("Prices", "routes.prices", "/api/prices", ["Prices"]),
    ("Orders", "routes.orders", "/api/orders", ["Orders"]),
    ("Trades", "routes.trades", "/api/trades", ["Trades"]),
    ("Chat", "routes.chat", "/api/chat", ["Chat"]),
    ("Payments", "routes.payments", "/api/payments", ["Payments"]),
    ("Settlements", "routes.settlements", "/api/settlements", ["Settlements"]),
    ("API Trade", "routes.api_trade", "/api/api-trade", ["API Trade"]),
    ("P2P", "routes.p2p", "/api/p2p", ["P2P"]),
    ("Assets", "routes.assets", "/api/assets", ["Assets"]),
    ("Reports", "routes.reports", "/api/reports", ["Reports"]),
    ("Verification", "routes.verification", "/api/verify", ["Verification"]),
    ("Payment Automation", "routes.payment_automation", "/api/payments/automation", ["Payment Automation"]),
    ("Admin", "routes.admin", "/api/admin", ["Admin"]),
    ("System", "routes.system", "/api/system", ["System"]),
    ("Fiat Gateway", "routes.fiat", "/api/fiat", ["Fiat"]),
]

for name, path, prefix, tags in routes_to_load:
    safe_import_router(name, path, prefix, tags)

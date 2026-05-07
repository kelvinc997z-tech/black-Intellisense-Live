from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from models import DBTrade, DBOrder, DBUser
import asyncio

class RiskEngine:
    """
    Calculates real-time platform exposure and manages guardrails.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_platform_exposure(self, symbol: str = None):
        """
        Calculate net exposure for a specific asset or the whole platform.
        Net Exposure = Sum(Buy Amount) - Sum(Sell Amount)
        """
        if symbol:
            query = select(DBTrade.amount).where(DBTrade.symbol == symbol)
            # This is a simplification; in real life we'd check trade side
            # We'll assume trade records contain a simplified amount where buy is positive, sell is negative
            # Or we query DBOrder for the side.
            
            # Better way: sum by order side
            buy_res = await self.db.execute(
                select(func.sum(DBOrder.amount)).where(DBOrder.symbol == symbol, DBOrder.side == "buy", DBOrder.status == "accepted")
            )
            sell_res = await self.db.execute(
                select(func.sum(DBOrder.amount)).where(DBOrder.symbol == symbol, DBOrder.side == "sell", DBOrder.status == "accepted")
            )
            
            buys = buy_res.scalar() or 0.0
            sells = sell_res.scalar() or 0.0
            return {"symbol": symbol, "net_exposure": buys - sells, "total_volume": buys + sells}
        
        return {"status": "global_exposure_calculation_pending"}

    async def check_circuit_breaker(self, symbol: str, price_change_pct: float):
        """
        Triggers an automatic stop if price volatility exceeds a threshold.
        """
        THRESHOLD = 5.0 # 5% move in short window
        if abs(price_change_pct) > THRESHOLD:
            return {"action": "HALT", "reason": f"Volatility spike: {price_change_pct}%"}
        return {"action": "ALLOW"}

    async def validate_credit_limit(self, user_id: str, requested_amount: float):
        """
        Checks if the user has enough credit/balance for the requested trade.
        """
        # In production, this would query a credit_limits table
        # Mocking a credit limit check
        USER_CREDIT_LIMIT = 1000000.0
        if requested_amount > USER_CREDIT_LIMIT:
            return {"allowed": False, "reason": "Credit limit exceeded"}
        return {"allowed": True}

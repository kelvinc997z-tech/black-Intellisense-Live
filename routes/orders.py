from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from models import Order, OrderCreate, OrderStatus, OrderSide, SettlementStatus, DBOrder, DBUser, DBTrade, DBSettlement
from routes.auth import get_current_user
from database import get_db
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.post("/", response_model=Order)
async def create_order(data: OrderCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    order_id = str(uuid.uuid4())
    total = data.amount * data.price
    
    order_doc = DBOrder(
        id=order_id,
        user_id=current_user["user_id"],
        symbol=data.symbol,
        side=data.side,
        amount=data.amount,
        price=data.price,
        total=total,
        status=OrderStatus.PENDING,
        filled_amount=0.0,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    
    db.add(order_doc)
    await db.commit()
    await db.refresh(order_doc)
    
    return order_doc

@router.get("/", response_model=List[Order])
async def get_orders(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(DBOrder)
        .where(DBOrder.user_id == current_user["user_id"])
        .order_by(desc(DBOrder.created_at))
    )
    orders = result.scalars().all()
    
    return orders

@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(DBOrder).where(DBOrder.id == order_id, DBOrder.user_id == current_user["user_id"])
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order

@router.patch("/{order_id}/cancel")
async def cancel_order(order_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    result = await db.execute(
        select(DBOrder).where(DBOrder.id == order_id, DBOrder.user_id == current_user["user_id"])
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending orders can be cancelled"
        )
    
    order.status = OrderStatus.CANCELLED
    order.updated_at = datetime.now(timezone.utc)
    await db.commit()
    
    return {"message": "Order cancelled successfully"}

@router.patch("/{order_id}/accept")
async def accept_order(order_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Accept counterparty order (Market Maker/Admin only)"""
    if current_user.get("role") not in ["admin", "market_maker"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only market makers can accept orders"
        )
    
    result = await db.execute(select(DBOrder).where(DBOrder.id == order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending orders can be accepted"
        )
    
    try:
        # Update order status
        order.status = OrderStatus.ACCEPTED
        order.updated_at = datetime.now(timezone.utc)
        order.accepted_by = current_user["user_id"]
        order.accepted_at = datetime.now(timezone.utc)
        
        # Create trade record
        trade_id = str(uuid.uuid4())
        trade_doc = DBTrade(
            id=trade_id,
            order_id=order_id,
            buyer_id=order.user_id if str(order.side) == OrderSide.BUY.value else current_user["user_id"],
            seller_id=current_user["user_id"] if str(order.side) == OrderSide.BUY.value else order.user_id,
            symbol=order.symbol,
            amount=order.amount,
            price=order.price,
            total=order.total,
            status="pending_payment",
            created_at=datetime.now(timezone.utc)
        )
        db.add(trade_doc)
        
        # Create settlement record
        settlement_id = str(uuid.uuid4())
        settlement_doc = DBSettlement(
            id=settlement_id,
            trade_id=trade_id,
            payment_proof_id=None,
            status=SettlementStatus.PENDING,
            order_id=order_id,
            counterparty_id=order.user_id,
            amount=order.total,
            created_at=datetime.now(timezone.utc)
        )
        db.add(settlement_doc)
        
        await db.commit()
    except Exception as e:
        await db.rollback()
        import traceback
        err_trace = traceback.format_exc()
        print(f"CRITICAL ACCEPT ORDER ERROR:\nOrder ID: {order_id}\nUser: {current_user['user_id']}\nTraceback:\n{err_trace}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error during acceptance: {str(e)}")
    
    return {
        "message": "Order accepted successfully",
        "order_id": order_id,
        "trade_id": trade_id,
        "settlement_id": settlement_id
    }

@router.patch("/{order_id}/reject")
async def reject_order(order_id: str, reason: str = None, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Reject counterparty order (Market Maker/Admin only)"""
    if current_user.get("role") not in ["admin", "market_maker"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only market makers can reject orders"
        )
    
    result = await db.execute(select(DBOrder).where(DBOrder.id == order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.status != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending orders can be rejected"
        )
    
    order.status = OrderStatus.REJECTED
    order.updated_at = datetime.now(timezone.utc)
    order.rejected_by = current_user["user_id"]
    order.rejected_at = datetime.now(timezone.utc)
    order.rejection_reason = reason
    
    await db.commit()
    
    return {"message": "Order rejected successfully", "order_id": order_id}

@router.get("/pending/all", response_model=List[Order])
async def get_all_pending_orders(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Get all pending orders from counterparties (Market Maker/Admin only)"""
    if current_user.get("role") not in ["admin", "market_maker"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only market makers can view all pending orders"
        )
    
    result = await db.execute(
        select(DBOrder)
        .where(DBOrder.status == OrderStatus.PENDING)
        .order_by(desc(DBOrder.created_at))
    )
    orders = result.scalars().all()
    
    # Enrich with user information (in SQLAlchemy we could use a join, but for compatibility with original logic:)
    enriched_orders = []
    for order in orders:
        user_result = await db.execute(select(DBUser).where(DBUser.id == order.user_id))
        user = user_result.scalar_one_or_none()
        
        order_dict = Order.model_validate(order).model_dump()
        if user:
            order_dict["user_email"] = user.email
            order_dict["user_name"] = user.full_name
        enriched_orders.append(Order(**order_dict))
    
    return enriched_orders

from fastapi import APIRouter, HTTPException, Depends, status
from models import Order, OrderCreate, OrderStatus
from routes.auth import get_current_user
import uuid
from datetime import datetime, timezone
from typing import List

router = APIRouter()

@router.post("/", response_model=Order)
async def create_order(data: OrderCreate, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    order_id = str(uuid.uuid4())
    total = data.amount * data.price
    
    order_doc = {
        "id": order_id,
        "user_id": current_user["user_id"],
        "symbol": data.symbol,
        "side": data.side,
        "amount": data.amount,
        "price": data.price,
        "total": total,
        "status": OrderStatus.PENDING,
        "filled_amount": 0.0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    return Order(**order_doc)

@router.get("/", response_model=List[Order])
async def get_orders(current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    orders = await db.orders.find({"user_id": current_user["user_id"]}).sort("created_at", -1).to_list(100)
    
    return [Order(**order) for order in orders]

@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    order = await db.orders.find_one({"id": order_id, "user_id": current_user["user_id"]})
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return Order(**order)

@router.patch("/{order_id}/cancel")
async def cancel_order(order_id: str, current_user: dict = Depends(get_current_user)):
    from server import get_db
    db = get_db()
    
    order = await db.orders.find_one({"id": order_id, "user_id": current_user["user_id"]})
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order["status"] != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending orders can be cancelled"
        )
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": OrderStatus.CANCELLED, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Order cancelled successfully"}

@router.patch("/{order_id}/accept")
async def accept_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Accept counterparty order (Market Maker/Admin only)"""
    from server import get_db
    db = get_db()
    
    # Check if user is market maker or admin
    if current_user.get("role") not in ["admin", "market_maker"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only market makers can accept orders"
        )
    
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order["status"] != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending orders can be accepted"
        )
    
    # Update order status
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {
            "status": OrderStatus.ACCEPTED,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "accepted_by": current_user["user_id"],
            "accepted_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Create trade record
    import uuid
    trade_id = str(uuid.uuid4())
    trade_doc = {
        "id": trade_id,
        "order_id": order_id,
        "buyer_id": order["user_id"] if order["side"] == "buy" else current_user["user_id"],
        "seller_id": current_user["user_id"] if order["side"] == "buy" else order["user_id"],
        "symbol": order["symbol"],
        "amount": order["amount"],
        "price": order["price"],
        "total": order["total"],
        "status": "pending_payment",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.trades.insert_one(trade_doc)
    
    # Create settlement record
    settlement_id = str(uuid.uuid4())
    settlement_doc = {
        "id": settlement_id,
        "trade_id": trade_id,
        "payment_proof_id": None,
        "status": "pending",
        "order_id": order_id,
        "counterparty_id": order["user_id"],
        "amount": order["total"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.settlements.insert_one(settlement_doc)
    
    return {
        "message": "Order accepted successfully",
        "order_id": order_id,
        "trade_id": trade_id,
        "settlement_id": settlement_id
    }

@router.patch("/{order_id}/reject")
async def reject_order(order_id: str, reason: str = None, current_user: dict = Depends(get_current_user)):
    """Reject counterparty order (Market Maker/Admin only)"""
    from server import get_db
    db = get_db()
    
    # Check if user is market maker or admin
    if current_user.get("role") not in ["admin", "market_maker"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only market makers can reject orders"
        )
    
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order["status"] != OrderStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending orders can be rejected"
        )
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {
            "status": OrderStatus.REJECTED,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "rejected_by": current_user["user_id"],
            "rejected_at": datetime.now(timezone.utc).isoformat(),
            "rejection_reason": reason
        }}
    )
    
    return {"message": "Order rejected successfully", "order_id": order_id}

@router.get("/pending/all", response_model=List[Order])
async def get_all_pending_orders(current_user: dict = Depends(get_current_user)):
    """Get all pending orders from counterparties (Market Maker/Admin only)"""
    from server import get_db
    db = get_db()
    
    # Check if user is market maker or admin
    if current_user.get("role") not in ["admin", "market_maker"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only market makers can view all pending orders"
        )
    
    orders = await db.orders.find({"status": OrderStatus.PENDING}).sort("created_at", -1).to_list(100)
    
    # Enrich with user information
    for order in orders:
        user = await db.users.find_one({"id": order["user_id"]})
        if user:
            order["user_email"] = user.get("email")
            order["user_name"] = user.get("full_name")
    
    return [Order(**order) for order in orders]

from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from models import DBPaymentProof, DBTrade, DBSettlement
from routes.auth import get_current_user, require_admin
from database import get_db
import csv
import io
from openpyxl import Workbook
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from datetime import datetime
from typing import List

router = APIRouter()

async def get_settlements_data(db: AsyncSession, user_id: str = None):
    """Fetch settlements data for export"""
    query = select(DBSettlement)
    if user_id:
        # Check if user is associated with the settlement as counterparty or approved by them
        query = query.where(or_(DBSettlement.counterparty_id == user_id, DBSettlement.approved_by == user_id))
    
    result = await db.execute(query)
    settlements = result.scalars().all()
    
    # Convert to list of dicts for easier processing, enriching with related data
    enriched_data = []
    for s in settlements:
        item = {
            "id": s.id,
            "trade_id": s.trade_id,
            "status": s.status,
            "approved_by": s.approved_by,
            "created_at": s.created_at,
            "approved_at": s.approved_at,
            "amount": s.amount
        }
        
        # Get payment proof details
        if s.payment_proof_id:
            p_result = await db.execute(select(DBPaymentProof).where(DBPaymentProof.id == s.payment_proof_id))
            proof = p_result.scalar_one_or_none()
            if proof:
                item["reference_code"] = proof.reference_code
                item["amount"] = proof.amount # Override with proof amount if available
        
        # Get trade details
        if s.trade_id:
            t_result = await db.execute(select(DBTrade).where(DBTrade.id == s.trade_id))
            trade = t_result.scalar_one_or_none()
            if trade:
                item["trade_symbol"] = trade.symbol
                item["trade_amount"] = trade.amount
        
        enriched_data.append(item)
    
    return enriched_data

@router.get("/settlements/csv")
async def export_settlements_csv(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Export settlements to CSV"""
    settlements = await get_settlements_data(db, current_user["user_id"])
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers
    writer.writerow([
        "Settlement ID",
        "Trade ID",
        "Symbol",
        "Amount",
        "Reference Code",
        "Status",
        "Approved By",
        "Created At",
        "Approved At"
    ])
    
    # Write data
    for settlement in settlements:
        writer.writerow([
            settlement.get("id", ""),
            settlement.get("trade_id", ""),
            settlement.get("trade_symbol", "N/A"),
            settlement.get("amount", 0),
            settlement.get("reference_code", "N/A"),
            settlement.get("status", ""),
            settlement.get("approved_by", "N/A"),
            settlement.get("created_at", ""),
            settlement.get("approved_at", "N/A")
        ])
    
    # Prepare response
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=settlements_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    )

@router.get("/settlements/excel")
async def export_settlements_excel(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Export settlements to Excel"""
    settlements = await get_settlements_data(db, current_user["user_id"])
    
    # Create workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Settlements"
    
    # Add headers
    headers = [
        "Settlement ID",
        "Trade ID",
        "Symbol",
        "Amount",
        "Reference Code",
        "Status",
        "Approved By",
        "Created At",
        "Approved At"
    ]
    ws.append(headers)
    
    # Style headers
    for cell in ws[1]:
        cell.font = cell.font.copy(bold=True)
        # openpyxl uses Hex without #
        # cell.fill = cell.fill.copy(fgColor="06B6D4") 
    
    # Add data
    for settlement in settlements:
        ws.append([
            settlement.get("id", ""),
            settlement.get("trade_id", ""),
            settlement.get("trade_symbol", "N/A"),
            settlement.get("amount", 0),
            settlement.get("reference_code", "N/A"),
            settlement.get("status", ""),
            settlement.get("approved_by", "N/A"),
            str(settlement.get("created_at", "")),
            str(settlement.get("approved_at", "N/A"))
        ])
    
    # Adjust column widths
    for column in ws.columns:
        max_length = 0
        column_letter = column[0].column_letter
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(cell.value)
            except:
                pass
        adjusted_width = min(max_length + 2, 50)
        ws.column_dimensions[column_letter].width = adjusted_width
    
    # Save to memory
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    return Response(
        content=output.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename=settlements_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        }
    )

@router.get("/settlements/pdf")
async def export_settlements_pdf(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Export settlements to PDF"""
    settlements = await get_settlements_data(db, current_user["user_id"])
    
    # Create PDF in memory
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#06B6D4'),
        spaceAfter=30,
    )
    
    # Add title
    title = Paragraph("Settlement Report", title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.2*inch))
    
    # Add generated date
    date_text = Paragraph(
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        styles['Normal']
    )
    elements.append(date_text)
    elements.append(Spacer(1, 0.3*inch))
    
    # Prepare table data
    data = [[
        "Trade ID",
        "Symbol",
        "Amount",
        "Status",
        "Created At"
    ]]
    
    for settlement in settlements:
        data.append([
            str(settlement.get("trade_id", ""))[:12] + "...",
            settlement.get("trade_symbol", "N/A"),
            f"${settlement.get('amount', 0):.2f}",
            str(settlement.get("status", "")).upper(),
            str(settlement.get("created_at", ""))[:10]
        ])
    
    # Create table
    table = Table(data, colWidths=[2*inch, 1*inch, 1*inch, 1*inch, 1.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#06B6D4')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(table)
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=settlements_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        }
    )

@router.get("/payments/csv")
async def export_payments_csv(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Export payment proofs to CSV"""
    query = select(DBPaymentProof)
    if current_user.get("role") not in ["admin", "market_maker"]:
        query = query.where(DBPaymentProof.user_id == current_user["user_id"])
    
    result = await db.execute(query)
    payments = result.scalars().all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Payment ID",
        "Trade ID",
        "Reference Code",
        "Amount",
        "Status",
        "File Name",
        "Created At"
    ])
    
    for payment in payments:
        writer.writerow([
            payment.id,
            payment.trade_id,
            payment.reference_code or "N/A",
            payment.amount,
            payment.status,
            payment.file_name,
            payment.created_at
        ])
    
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=payments_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    )

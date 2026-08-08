import asyncio
import json
import logging
import os
import sys
import time
import io
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base, get_db
from models import (
    UserCreate, Token, DBUser, DBReport, VendorQuery, TrustReport,
    RiskFlag, VendorIdentity, GSTCompliance, LegalIntelligence, DirectorIntelligence
)
from auth import verify_password, get_password_hash, create_access_token, get_current_user
from scrapers import mca, ecourts, nclt, rbi_defaulter, google_news
from scoring.engine import ScoringEngine
from ocr.invoice_reader import extract_invoice_data

try:
    from setu_client import fetch_gstin_data
except ImportError:
    async def fetch_gstin_data(query: str):
        return {"success": False, "status": "Unknown", "company_name": "Unknown", "gstin": query}

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VendorCheck V3 API")

# Setup CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scoring_engine = ScoringEngine()

class CheckRequest(BaseModel):
    query_value: str
    company_name: Optional[str] = None

# Helper to run all scrapers in parallel
async def run_all_scrapers(query_value: str, company_name: str):
    tasks = {
        'gst': fetch_gstin_data(query_value),
        'mca': mca.search_mca(company_name or query_value),
        'ecourts': ecourts.search_ecourts(company_name or query_value),
        'nclt': nclt.search_nclt(company_name or query_value),
        'rbi': rbi_defaulter.check_defaulter(company_name or query_value),
        'news': google_news.search_news(company_name or query_value),
    }
    
    results = await asyncio.gather(*tasks.values(), return_exceptions=True)
    return dict(zip(tasks.keys(), results))

# Helper to shape GST results into ScoringEngine format
def format_gst_result(gst_res: dict, query_value: str) -> dict:
    success = gst_res.get("success", False)
    gst_status = gst_res.get("status", "Unknown")
    is_active = gst_status.lower() in ["active", "act"]

    score_impact = 0
    findings = []

    if success:
        if not is_active:
            score_impact = -25
            findings.append(f"GST registration status is '{gst_status}' (not Active).")
        else:
            findings.append("GST registration is Active.")
    else:
        score_impact = -10
        findings.append("Could not verify GSTIN via Setu API.")

    return {
        'success': success,
        'source': 'GST',
        'score_impact': score_impact,
        'findings': findings,
        'data': gst_res
    }

# ---------- Auth Endpoints ----------

@app.post("/api/v1/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user.password)
    new_user = DBUser(email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/v1/login", response_model=Token)
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# ---------- Core Endpoints ----------

@app.post("/api/v1/check")
async def check_sync(
    req: CheckRequest,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = req.query_value
    name = req.company_name or query
    
    # 1. Run all scrapers
    results_map = await run_all_scrapers(query, name)
    
    # 2. Shape results for scoring engine
    valid_results = []
    
    # GST
    gst_res = results_map.get('gst')
    if isinstance(gst_res, Exception):
        logger.error(f"GST scraper failed: {gst_res}")
        gst_formatted = format_gst_result({"success": False}, query)
    else:
        gst_formatted = format_gst_result(gst_res, query)
    valid_results.append(gst_formatted)
    
    # Other sources
    for source_key in ['mca', 'ecourts', 'nclt', 'rbi', 'news']:
        res = results_map.get(source_key)
        if isinstance(res, Exception):
            logger.error(f"Scraper {source_key} failed: {res}")
        elif res:
            valid_results.append(res)
            
    # Calculate score report
    score_report = scoring_engine.calculate(valid_results)
    
    # Determine company name and cin
    company_name = name
    cin = query
    if isinstance(gst_res, dict) and gst_res.get('success'):
        company_name = gst_res.get('company_name', name)
    elif results_map.get('mca') and isinstance(results_map['mca'], dict) and results_map['mca'].get('success'):
        company_name = results_map['mca'].get('company_name', name)
        cin = results_map['mca'].get('cin', query)

    # Save to Database
    db_report = DBReport(
        user_id=current_user.id,
        company_name=company_name,
        cin=cin,
        trust_score=score_report['trust_score'],
        status="Approved" if score_report['trust_score'] >= 50 else "Rejected"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return {
        "status": "success",
        "report_id": db_report.id,
        "results": valid_results,
        "score_report": score_report
    }

@app.post("/api/v1/check/stream")
async def check_stream(
    req: CheckRequest,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = req.query_value
    name = req.company_name or query

    async def event_generator():
        tasks = {
            'gst': fetch_gstin_data(query),
            'mca': mca.search_mca(name),
            'ecourts': ecourts.search_ecourts(name),
            'nclt': nclt.search_nclt(name),
            'rbi': rbi_defaulter.check_defaulter(name),
            'news': google_news.search_news(name),
        }
        
        pending = {asyncio.create_task(coro, name=task_name) for task_name, coro in tasks.items()}
        scraper_results = []
        
        while pending:
            done, pending = await asyncio.wait(pending, return_when=asyncio.FIRST_COMPLETED)
            for task in done:
                task_name = task.get_name()
                try:
                    result = task.result()
                    if task_name == 'gst':
                        formatted_res = format_gst_result(result, query)
                    else:
                        formatted_res = result
                    scraper_results.append(formatted_res)
                    yield f"data: {json.dumps({'event': 'scraper_result', 'task': task_name, 'data': formatted_res})}\n\n"
                except Exception as e:
                    logger.error(f"Task {task_name} failed: {e}")
                    yield f"data: {json.dumps({'event': 'scraper_error', 'task': task_name, 'error': str(e)})}\n\n"
                    
        score_report = scoring_engine.calculate(scraper_results)
        
        # Save to DB on stream completion
        company_name = name
        cin = query
        gst_data = next((r['data'] for r in scraper_results if r.get('source') == 'GST' and r.get('success')), None)
        if gst_data:
            company_name = gst_data.get('company_name', name)
        else:
            mca_data = next((r for r in scraper_results if r.get('source') == 'MCA21' and r.get('success')), None)
            if mca_data:
                company_name = mca_data.get('company_name', name)
                cin = mca_data.get('cin', query)

        db_report = DBReport(
            user_id=current_user.id,
            company_name=company_name,
            cin=cin,
            trust_score=score_report['trust_score'],
            status="Approved" if score_report['trust_score'] >= 50 else "Rejected"
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        yield f"data: {json.dumps({'event': 'scoring_complete', 'report_id': db_report.id, 'data': score_report})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# ---------- Analytics ----------

@app.get("/api/v1/analytics")
def get_analytics(current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    reports = db.query(DBReport).filter(DBReport.user_id == current_user.id).all()
    total = len(reports)
    if total == 0:
        return {"total": 0, "avg_score": 0, "approved": 0, "rejected": 0, "recent": []}
        
    avg_score = sum(r.trust_score for r in reports) / total
    approved = sum(1 for r in reports if r.trust_score >= 50)
    rejected = total - approved
    
    return {
        "total": total,
        "avg_score": round(avg_score),
        "approved": approved,
        "rejected": rejected,
        "recent": [{"id": r.id, "company_name": r.company_name, "score": r.trust_score, "date": r.created_at.strftime("%b %d, %Y")} for r in reversed(reports[-5:])]
    }

# ---------- History ----------

@app.get("/api/v1/history")
def get_history(current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    reports = db.query(DBReport).filter(DBReport.user_id == current_user.id).order_by(DBReport.created_at.desc()).all()
    return [{
        "id": r.id,
        "company_name": r.company_name,
        "cin": r.cin,
        "trust_score": r.trust_score,
        "status": r.status,
        "date": r.created_at.strftime("%b %d, %Y")
    } for r in reports]

# ---------- PDF Report Generation ----------

@app.get("/api/v1/report/{report_id}/pdf")
def generate_pdf(
    report_id: int,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
    except ImportError:
        raise HTTPException(status_code=500, detail="reportlab not installed. Run: pip install reportlab")

    report_row = db.query(DBReport).filter(DBReport.id == report_id, DBReport.user_id == current_user.id).first()
    if not report_row:
        raise HTTPException(status_code=404, detail="Report not found")

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Header bar
    p.setFillColorRGB(0.05, 0.05, 0.12)
    p.rect(0, height - 80, width, 80, fill=1, stroke=0)
    p.setFillColorRGB(1, 1, 1)
    p.setFont("Helvetica-Bold", 20)
    p.drawString(40, height - 45, "VendorCheck")
    p.setFont("Helvetica", 11)
    p.drawString(40, height - 65, "Enterprise Vendor Due Diligence Report")

    # Date
    p.setFillColorRGB(0.6, 0.6, 0.6)
    p.setFont("Helvetica", 10)
    p.drawRightString(width - 40, height - 50, f"Generated: {report_row.created_at.strftime('%d %b %Y')}")

    # Trust Score badge
    score = report_row.trust_score
    if score >= 75:
        r, g, b = 0.06, 0.74, 0.44   # green
    elif score >= 50:
        r, g, b = 0.96, 0.62, 0.04   # orange
    else:
        r, g, b = 0.94, 0.27, 0.27   # red

    p.setFillColorRGB(r, g, b)
    p.roundRect(width - 150, height - 175, 110, 80, 12, fill=1, stroke=0)
    p.setFillColorRGB(1, 1, 1)
    p.setFont("Helvetica-Bold", 32)
    p.drawCentredString(width - 95, height - 145, str(score))
    p.setFont("Helvetica", 9)
    p.drawCentredString(width - 95, height - 160, "TRUST SCORE / 100")

    # Company Name
    p.setFillColorRGB(0.1, 0.1, 0.1)
    p.setFont("Helvetica-Bold", 16)
    p.drawString(40, height - 120, report_row.company_name)
    p.setFont("Helvetica", 11)
    p.setFillColorRGB(0.4, 0.4, 0.4)
    p.drawString(40, height - 140, f"CIN / Identifier: {report_row.cin}")

    # Status
    status_color = (0.06, 0.74, 0.44) if report_row.status == "Approved" else (0.94, 0.27, 0.27)
    p.setFillColorRGB(*status_color)
    p.setFont("Helvetica-Bold", 11)
    p.drawString(40, height - 165, f"Recommendation: {report_row.status}")

    # Divider
    p.setStrokeColorRGB(0.85, 0.85, 0.85)
    p.line(40, height - 185, width - 40, height - 185)

    # Info rows
    p.setFillColorRGB(0.1, 0.1, 0.1)
    y = height - 215
    p.setFont("Helvetica-Bold", 12)
    p.drawString(40, y, "Report Details")
    y -= 20
    p.setFont("Helvetica", 11)
    rows = [
        ("Report ID", str(report_row.id)),
        ("Analyzed Date", report_row.created_at.strftime("%d %b %Y, %H:%M UTC")),
        ("Analyzed By", current_user.email),
        ("Final Score", f"{score} / 100"),
        ("Verdict", report_row.status),
    ]
    for label, value in rows:
        p.setFillColorRGB(0.5, 0.5, 0.5)
        p.drawString(40, y, label)
        p.setFillColorRGB(0.1, 0.1, 0.1)
        p.drawString(200, y, value)
        y -= 18

    # Footer
    p.setFillColorRGB(0.6, 0.6, 0.6)
    p.setFont("Helvetica-Oblique", 9)
    p.drawString(40, 30, "This report is confidential and generated by VendorCheck — AI-powered Vendor Due Diligence Platform.")
    p.setFillColorRGB(0.05, 0.05, 0.12)
    p.rect(0, 0, width, 20, fill=1, stroke=0)

    p.showPage()
    p.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=VendorCheck_Report_{report_id}.pdf"}
    )

# ---------- Invoice OCR Verification ----------

@app.post("/api/v1/invoice/verify")
async def verify_invoice(
    file: UploadFile = File(...),
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    temp_path = f"c:/Users/mukhi/Documents/vendorcheck/backend/{file.filename}"
    try:
        with open(temp_path, "wb") as f:
            f.write(await file.read())
            
        data = extract_invoice_data(temp_path)
        
        # Save this check as a report in history too
        db_report = DBReport(
            user_id=current_user.id,
            company_name=data.get("seller_name", "Unknown Seller"),
            cin=data.get("seller_gstin", "N/A"),
            trust_score=85, # Default verified score
            status="Approved"
        )
        db.add(db_report)
        db.commit()
        
        return {"status": "success", "data": data}
    except Exception as e:
        logger.error(f"Invoice verification failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

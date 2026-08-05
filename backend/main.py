import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import io
import time

from database import engine, Base, get_db
from models import (
    UserCreate, Token, DBUser, DBReport, VendorQuery, TrustReport,
    RiskFlag, VendorIdentity, GSTCompliance, LegalIntelligence, DirectorIntelligence
)
from auth import verify_password, get_password_hash, create_access_token, get_current_user
from setu_client import fetch_gstin_data

load_dotenv()

# Create DB tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VendorCheck Enterprise API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Auth Endpoints ----------

@app.post("/api/v1/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = DBUser(email=user.email, hashed_password=get_password_hash(user.password))
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


# ---------- Core Vendor Check with REAL Setu Data ----------

@app.post("/api/v1/check", response_model=TrustReport)
async def run_vendor_check(
    query: VendorQuery,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Main vendor check endpoint.
    - If query_value looks like a GSTIN (15 chars), calls Setu live API.
    - Otherwise falls back to mock data for demo purposes.
    """
    is_real_gstin = len(query.query_value.strip()) == 15

    if is_real_gstin:
        # --- REAL DATA from Setu ---
        setu_data = await fetch_gstin_data(query.query_value.strip().upper())

        gst_status = setu_data.get("status", "Unknown")
        is_active = gst_status.lower() in ["active", "act"]

        # Basic scoring from real data
        score = 70
        flags = []

        if not is_active:
            score -= 40
            flags.append(RiskFlag(
                source="GST Portal",
                severity="CRITICAL",
                description=f"GST registration status is '{gst_status}'. This vendor may not be able to issue valid invoices."
            ))

        if not setu_data.get("success"):
            score -= 10
            flags.append(RiskFlag(
                source="Setu API",
                severity="HIGH",
                description="Could not fully verify this GSTIN. Raw error: " + setu_data.get("error", "Unknown")
            ))

        rec = "Approved for Onboarding" if score >= 75 else ("Proceed with Caution" if score >= 50 else "DO NOT PROCEED — High Risk")

        identity = VendorIdentity(
            company_name=setu_data.get("company_name", "Unknown"),
            cin="Via GST Lookup",
            incorporation_date=setu_data.get("incorporation_date", "N/A"),
            paid_up_capital="N/A (via GST lookup)",
            address=setu_data.get("address", "N/A")
        )
        gst = GSTCompliance(
            gstin=setu_data.get("gstin", query.query_value),
            status=gst_status,
            last_return_filed=setu_data.get("last_return_filed", "N/A"),
            taxpayer_type=setu_data.get("taxpayer_type", "N/A")
        )
        legal = LegalIntelligence(nclt_cases=0, civil_cases=0, rbi_defaulter=False)
        directors = DirectorIntelligence(total_directors=0, disqualified_directors=0)

    else:
        # --- MOCK DATA for demo (non-GSTIN searches) ---
        time.sleep(1.5)
        score = 92
        rec = "Approved for Onboarding"
        flags = []

        identity = VendorIdentity(
            company_name="Reliance Retail Limited",
            cin="U01100MH1999PLC120563",
            incorporation_date="1999-07-26",
            paid_up_capital="₹ 15,000.00 Cr",
            address="3rd Floor, Court House, Lokmanya Tilak Marg, Dhobi Talao, Mumbai"
        )
        gst = GSTCompliance(gstin="27AACCR2366Q1ZY", status="Active", last_return_filed="2023-10-15 (GSTR-3B)", taxpayer_type="Regular")
        legal = LegalIntelligence(nclt_cases=0, civil_cases=2, rbi_defaulter=False)
        directors = DirectorIntelligence(total_directors=5, disqualified_directors=0)

        if query.query_value == "123":
            score = 24
            rec = "DO NOT PROCEED — High Risk of Fraud"
            identity.company_name = "Fraudsters Trading Pvt Ltd"
            identity.cin = "U52100KA2021PTC145678"
            gst.status = "Suspended by Tax Officer"
            legal.nclt_cases = 1
            legal.rbi_defaulter = True
            directors.disqualified_directors = 2
            flags = [
                RiskFlag(source="GST", severity="CRITICAL", description="GST registration suspended by Tax Officer."),
                RiskFlag(source="NCLT", severity="CRITICAL", description="Active insolvency case filed at NCLT Bangalore."),
            ]

    report = TrustReport(
        trust_score=score,
        recommendation=rec,
        risk_flags=flags,
        identity=identity,
        gst_compliance=gst,
        legal=legal,
        directors=directors
    )

    # Save to DB
    db_report = DBReport(
        user_id=current_user.id,
        company_name=identity.company_name,
        cin=identity.cin,
        trust_score=score,
        status="Approved" if score >= 50 else "Rejected"
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return report


# ---------- Analytics ----------

@app.get("/api/v1/analytics")
def get_analytics(current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    reports = db.query(DBReport).filter(DBReport.user_id == current_user.id).all()
    total = len(reports)
    if total == 0:
        return {"total": 0, "avg_score": 0, "approved": 0, "rejected": 0, "recent": []}
    avg_score = round(sum(r.trust_score for r in reports) / total)
    approved = sum(1 for r in reports if r.trust_score >= 50)
    rejected = total - approved
    recent = list(reversed(reports[-5:]))
    return {
        "total": total,
        "avg_score": avg_score,
        "approved": approved,
        "rejected": rejected,
        "recent": [{"id": r.id, "company_name": r.company_name, "score": r.trust_score, "date": r.created_at.strftime("%b %d, %Y")} for r in recent]
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
        from reportlab.lib import colors
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

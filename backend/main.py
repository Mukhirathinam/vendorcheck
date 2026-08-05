from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import (
    UserCreate, Token, DBUser, DBReport, VendorQuery, TrustReport, RiskFlag, 
    VendorIdentity, GSTCompliance, LegalIntelligence, DirectorIntelligence
)
from auth import verify_password, get_password_hash, create_access_token, get_current_user
import time

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VendorCheck Enterprise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/api/v1/check", response_model=TrustReport)
def run_vendor_check(query: VendorQuery, current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    time.sleep(1.5) # Simulate processing delay
    
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
        rec = "DO NOT PROCEED. High risk of fraud."
        identity.company_name = "Fraudsters Trading Pvt Ltd"
        identity.cin = "U52100KA2021PTC145678"
        gst.status = "Suspended by Tax Officer"
        legal.nclt_cases = 1
        legal.rbi_defaulter = True
        directors.disqualified_directors = 2
        flags = [RiskFlag(source="GST", severity="CRITICAL", description="GST suspended."), RiskFlag(source="NCLT", severity="CRITICAL", description="Insolvency.")]
        
    report = TrustReport(trust_score=score, recommendation=rec, risk_flags=flags, identity=identity, gst_compliance=gst, legal=legal, directors=directors)
    
    # Save to Database
    db_report = DBReport(
        user_id=current_user.id,
        company_name=identity.company_name,
        cin=identity.cin,
        trust_score=score,
        status="Approved" if score >= 50 else "Rejected"
    )
    db.add(db_report)
    db.commit()
    
    return report

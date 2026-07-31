from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import VendorQuery, TrustReport, RiskFlag, VendorIdentity, GSTCompliance, LegalIntelligence, DirectorIntelligence
import time

app = FastAPI(title="VendorCheck Enterprise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/check", response_model=TrustReport)
def run_vendor_check(query: VendorQuery):
    time.sleep(1.5) # Simulate processing delay for UI loader
    
    # Base Safe Profile
    score = 92
    rec = "Approved for Onboarding"
    flags = []
    
    identity = VendorIdentity(
        company_name="Reliance Retail Limited",
        cin="U01100MH1999PLC120563",
        incorporation_date="1999-07-26",
        paid_up_capital="₹ 15,000.00 Cr",
        address="3rd Floor, Court House, Lokmanya Tilak Marg, Dhobi Talao, Mumbai, 400002"
    )
    
    gst = GSTCompliance(
        gstin="27AACCR2366Q1ZY",
        status="Active",
        last_return_filed="2023-10-15 (GSTR-3B)",
        taxpayer_type="Regular"
    )
    
    legal = LegalIntelligence(
        nclt_cases=0,
        civil_cases=2,
        rbi_defaulter=False
    )
    
    directors = DirectorIntelligence(
        total_directors=5,
        disqualified_directors=0
    )

    # Trigger fraudulent response on '123'
    if query.query_value == "123":
        score = 24
        rec = "DO NOT PROCEED. High risk of fraud."
        identity.company_name = "Fraudsters Trading Pvt Ltd"
        identity.cin = "U52100KA2021PTC145678"
        identity.paid_up_capital = "₹ 1.00 Lakh"
        gst.status = "Suspended by Tax Officer"
        gst.last_return_filed = "2022-04-10 (GSTR-3B)"
        legal.nclt_cases = 1
        legal.rbi_defaulter = True
        directors.disqualified_directors = 2
        
        flags = [
            RiskFlag(source="GST", severity="CRITICAL", description="GST Registration suspended due to non-filing of returns for > 6 months."),
            RiskFlag(source="NCLT", severity="CRITICAL", description="Active insolvency proceeding found under IBC 2016."),
            RiskFlag(source="MCA", severity="HIGH", description="2 out of 5 directors are currently disqualified under Sec 164(2)."),
            RiskFlag(source="RBI", severity="CRITICAL", description="Entity listed on RBI Wilful Defaulter list.")
        ]
        
    return TrustReport(
        trust_score=score,
        recommendation=rec,
        risk_flags=flags,
        identity=identity,
        gst_compliance=gst,
        legal=legal,
        directors=directors
    )

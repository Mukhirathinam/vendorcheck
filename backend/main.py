from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import VendorQuery, TrustReport, RiskFlag
from scoring import calculate_trust_score

app = FastAPI(title="VendorCheck API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/check", response_model=TrustReport)
def run_vendor_check(query: VendorQuery):
    # This is a mock implementation pending real API integrations
    
    # Mocked fetched data
    mock_mca = {"company_status": "Active", "nclt_proceedings": False}
    mock_gst = {"status": "Active"}
    mock_ecourts = {}
    
    # Force some demo scenarios based on input
    if query.query_value == "123":
        mock_mca["company_status"] = "Struck Off"
        mock_gst["status"] = "Suspended"
        
    result = calculate_trust_score(mock_mca, mock_gst, mock_ecourts)
    
    return TrustReport(
        vendor_name="Demo Enterprises Pvt Ltd" if query.query_value != "123" else "Fraudsters Inc",
        trust_score=result["trust_score"],
        recommendation=result["recommendation"],
        risk_flags=[RiskFlag(**flag) for flag in result["flags"]],
        mca_status=mock_mca["company_status"],
        gst_status=mock_gst["status"]
    )

from pydantic import BaseModel
from typing import Optional, List

class VendorQuery(BaseModel):
    query_type: str  # 'gst', 'cin', 'name'
    query_value: str

class RiskFlag(BaseModel):
    source: str
    severity: str
    description: str

class TrustReport(BaseModel):
    vendor_name: str
    trust_score: int
    recommendation: str
    risk_flags: List[RiskFlag]
    mca_status: str
    gst_status: str

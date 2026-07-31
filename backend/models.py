from pydantic import BaseModel
from typing import Optional, List, Dict

class VendorQuery(BaseModel):
    query_type: str  # 'gst', 'cin', 'name'
    query_value: str

class RiskFlag(BaseModel):
    source: str
    severity: str
    description: str

class VendorIdentity(BaseModel):
    company_name: str
    cin: str
    incorporation_date: str
    paid_up_capital: str
    address: str

class GSTCompliance(BaseModel):
    gstin: str
    status: str
    last_return_filed: str
    taxpayer_type: str

class LegalIntelligence(BaseModel):
    nclt_cases: int
    civil_cases: int
    rbi_defaulter: bool

class DirectorIntelligence(BaseModel):
    total_directors: int
    disqualified_directors: int

class TrustReport(BaseModel):
    trust_score: int
    recommendation: str
    risk_flags: List[RiskFlag]
    identity: VendorIdentity
    gst_compliance: GSTCompliance
    legal: LegalIntelligence
    directors: DirectorIntelligence

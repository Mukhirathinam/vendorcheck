from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime
from pydantic import BaseModel
from typing import Optional, List

# --- SQLAlchemy DB Models ---
class DBUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    reports = relationship("DBReport", back_populates="owner")

class DBReport(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    company_name = Column(String)
    cin = Column(String)
    trust_score = Column(Integer)
    status = Column(String) # 'Approved', 'Rejected'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    owner = relationship("DBUser", back_populates="reports")

# --- Pydantic Schemas ---
class UserCreate(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class VendorQuery(BaseModel):
    query_type: str
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

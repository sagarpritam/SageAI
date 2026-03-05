from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ScanRequest(BaseModel):
    """Scan request body."""
    target: str


class Vulnerability(BaseModel):
    """Individual finding from a scan."""
    type: str
    description: Optional[str] = None
    severity: str
    missing_headers: Optional[List[str]] = None


class RiskSummary(BaseModel):
    """Aggregated risk score."""
    risk_score: int
    risk_level: str
    total_findings: int


class ScanResponse(BaseModel):
    """Full scan result returned to client."""
    id: str
    target: str
    status: str
    timestamp: datetime
    findings: List[Vulnerability]
    risk_summary: RiskSummary


class ScanListItem(BaseModel):
    """Summary item for scan listing."""
    id: str
    target: str
    status: str
    risk_score: int
    risk_level: str
    created_at: datetime

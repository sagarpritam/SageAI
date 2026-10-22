from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ScanRequest(BaseModel):
    """Scan request body."""

    target: HttpUrl = Field(..., description="Target URL to scan")
    idempotency_key: Optional[str] = Field(None, description="Client idempotency key to prevent duplicate scans")
    async_mode: bool = Field(False, description="If True, dispatches to worker fleet and returns immediately")
    deep_scan: bool = Field(False, description="Enable deep network template and port scans")

    model_config = ConfigDict(extra="ignore")


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
    analyzed_findings: Optional[List[dict]] = None
    risk_summary: RiskSummary
    is_authorized: bool = False
    report: Optional[dict] = None
    graph: Optional[dict] = None


class ScanListItem(BaseModel):
    """Summary item for scan listing."""

    id: str
    target: str
    status: str
    risk_score: int
    risk_level: str
    is_authorized: bool = False
    created_at: datetime

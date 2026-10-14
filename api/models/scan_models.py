from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ScanRequest(BaseModel):
    target: str


class ScanResponse(BaseModel):
    scan_id: str
    status: str
    results: dict = {}
    analyzed_findings: Optional[List[Dict[str, Any]]] = None
    report: Optional[Dict[str, Any]] = None

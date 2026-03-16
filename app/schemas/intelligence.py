from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any

class IntelligenceSweepRequest(BaseModel):
    target: str
    target_type: str

class ModuleScanRequest(BaseModel):
    target: str
    target_type: str = "domain"

class IntelligenceSweepResponse(BaseModel):
    status: str
    results: Dict[str, Any]

class LinkAnalysisResponse(BaseModel):
    module: str
    graph: Dict[str, Any]
    meta: Dict[str, Any]

class ModuleListResponse(BaseModel):
    modules: List[Dict[str, Any]]

class ModuleScanResponse(BaseModel):
    module: str
    findings: List[Dict[str, Any]]

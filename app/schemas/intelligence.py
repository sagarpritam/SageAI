from typing import Any, Dict, List

from pydantic import BaseModel


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


class DeepSearchRequest(BaseModel):
    target: str
    target_type: str = "domain"
    max_depth: int = 3
    max_entities: int = 25


class DeepSearchResponse(BaseModel):
    session_id: str
    status: str
    target: str
    target_type: str
    stats: Dict[str, Any]
    graph: Dict[str, Any]
    timeline: List[Dict[str, Any]]
    briefing: str
    entities: Dict[str, Any]

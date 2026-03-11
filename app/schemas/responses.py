from typing import Any, Dict, List
from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class MFASetupResponse(BaseModel):
    secret: str
    qr_code: str
    backup_codes: List[str]
    message: str


class MFAStateResponse(BaseModel):
    message: str
    mfa_enabled: bool


class AgentInfo(BaseModel):
    name: str
    role: str
    status: str


class AgentListResponse(BaseModel):
    agents: List[AgentInfo]
    orchestrator: str


class AsyncAssessmentResponse(BaseModel):
    status: str
    target: str
    message: str


class AttackPathResponse(BaseModel):
    org_id: str
    attack_paths: List[Any]
    count: int


class PluginListingResponse(BaseModel):
    total: int
    plugins: List[Dict[str, Any]]
    categories: List[str]


class PluginRunAllResponse(BaseModel):
    target: str
    plugins_run: int
    results: List[Dict[str, Any]]

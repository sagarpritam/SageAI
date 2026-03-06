"""
SageAI 2.0 — Asset Pydantic Schemas
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.models.asset import AssetType, AssetStatus


class AssetBase(BaseModel):
    asset_type: AssetType = AssetType.subdomain
    value: str
    ip_address: Optional[str] = None


class AssetOut(BaseModel):
    id: str
    org_id: str
    asset_type: AssetType
    value: str
    ip_address: Optional[str] = None
    open_ports: List[int] = []
    technologies: List[str] = []
    http_status: Optional[int] = None
    http_title: Optional[str] = None
    risk_score: float = 0.0
    risk_level: str = "Low"
    status: AssetStatus = AssetStatus.active
    first_seen: datetime
    last_seen: datetime
    last_scanned: Optional[datetime] = None
    discovered_in_scan: Optional[str] = None

    class Config:
        from_attributes = True


class AssetSummary(BaseModel):
    total: int = 0
    domains: int = 0
    subdomains: int = 0
    ips: int = 0
    servers: int = 0
    apis: int = 0
    cloud_resources: int = 0
    high_risk: int = 0
    critical: int = 0
    active: int = 0
    stale: int = 0
    new_last_24h: int = 0


class DiscoveryRequest(BaseModel):
    target: str  # root domain e.g. "example.com"
    scan_id: Optional[str] = None

"""
SageAI 2.0 — Asset Model
Stores discovered attack surface assets per organization.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, DateTime, Text, Enum as SAEnum, ForeignKey
)
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class AssetType(str, enum.Enum):
    domain = "domain"
    subdomain = "subdomain"
    ip = "ip"
    server = "server"
    api = "api"
    cloud_resource = "cloud_resource"


class AssetStatus(str, enum.Enum):
    active = "active"
    stale = "stale"
    unknown = "unknown"


class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)

    # Identity
    asset_type = Column(SAEnum(AssetType), default=AssetType.subdomain, nullable=False, index=True)
    value = Column(String, nullable=False, index=True)          # domain/IP/URL/CIDR
    ip_address = Column(String, nullable=True, index=True)

    # Discovery metadata
    open_ports = Column(Text, default="[]")          # JSON list  [80, 443, 8080]
    technologies = Column(Text, default="[]")        # JSON list  ["nginx", "React"]
    dns_records = Column(Text, default="{}")         # JSON dict
    ssl_info = Column(Text, default="{}")            # JSON dict  (issuer, expiry, etc.)
    http_status = Column(Integer, nullable=True)     # 200 / 404 / None
    http_title = Column(String, nullable=True)

    # Risk
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String, default="Low")       # Low / Medium / High / Critical
    risk_summary = Column(Text, default="{}")        # JSON

    # Shodan / external intel
    shodan_data = Column(Text, default="{}")         # JSON
    virustotal_data = Column(Text, default="{}")     # JSON

    # Lifecycle
    status = Column(SAEnum(AssetStatus), default=AssetStatus.active)
    first_seen = Column(DateTime, default=datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.utcnow)
    last_scanned = Column(DateTime, nullable=True)

    # Related scan
    discovered_in_scan = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

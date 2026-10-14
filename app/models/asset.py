"""
SageAI 2.0 — Asset Model
Stores discovered attack surface assets per organization.
"""

import enum

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship, synonym

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


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

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    org_id = synonym("organization_id")

    # Identity
    asset_type = Column(
        SAEnum(AssetType), default=AssetType.subdomain, nullable=False, index=True
    )
    value = Column(String, nullable=False, index=True)  # domain/IP/URL/CIDR
    ip_address = Column(String, nullable=True, index=True)

    # Discovery metadata
    open_ports = Column(Text, default="[]")  # JSON list  [80, 443, 8080]
    technologies = Column(Text, default="[]")  # JSON list  ["nginx", "React"]
    dns_records = Column(Text, default="{}")  # JSON dict
    ssl_info = Column(Text, default="{}")  # JSON dict  (issuer, expiry, etc.)
    http_status = Column(Integer, nullable=True)  # 200 / 404 / None
    http_title = Column(String, nullable=True)

    # Risk
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String, default="Low")  # Low / Medium / High / Critical
    risk_summary = Column(Text, default="{}")  # JSON

    # Shodan / external intel
    shodan_data = Column(Text, default="{}")  # JSON
    virustotal_data = Column(Text, default="{}")  # JSON

    # Lifecycle
    status = Column(SAEnum(AssetStatus), default=AssetStatus.active)
    first_seen = Column(DateTime(timezone=True), default=utc_now)
    last_seen = Column(DateTime(timezone=True), default=utc_now)
    last_scanned = Column(DateTime(timezone=True), nullable=True)

    # Related scan
    discovered_in_scan = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    organization = relationship("Organization", back_populates="assets")
    asm_events = relationship(
        "ASMEvent", back_populates="asset", cascade="all, delete-orphan"
    )
    diffs = relationship(
        "AttackSurfaceDiff", back_populates="asset", cascade="all, delete-orphan"
    )

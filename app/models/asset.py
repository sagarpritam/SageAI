"""
SageAI 2.0 — Asset Model
Stores discovered attack surface assets per organization.
"""

import enum
from datetime import datetime

from sqlalchemy import (
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
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym

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

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    org_id = synonym("organization_id")

    # Identity
    asset_type: Mapped[AssetType] = mapped_column(
        SAEnum(AssetType), default=AssetType.subdomain, nullable=False, index=True
    )
    value: Mapped[str] = mapped_column(
        String, nullable=False, index=True
    )  # domain/IP/URL/CIDR
    ip_address: Mapped[str | None] = mapped_column(String, nullable=True, index=True)

    # Discovery metadata
    open_ports: Mapped[str] = mapped_column(
        Text, default="[]"
    )  # JSON list  [80, 443, 8080]
    technologies: Mapped[str] = mapped_column(
        Text, default="[]"
    )  # JSON list  ["nginx", "React"]
    dns_records: Mapped[str] = mapped_column(Text, default="{}")  # JSON dict
    ssl_info: Mapped[str] = mapped_column(
        Text, default="{}"
    )  # JSON dict  (issuer, expiry, etc.)
    http_status: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )  # 200 / 404 / None
    http_title: Mapped[str | None] = mapped_column(String, nullable=True)

    # Risk
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    risk_level: Mapped[str] = mapped_column(
        String, default="Low"
    )  # Low / Medium / High / Critical
    risk_summary: Mapped[str] = mapped_column(Text, default="{}")  # JSON

    # Shodan / external intel
    shodan_data: Mapped[str] = mapped_column(Text, default="{}")  # JSON
    virustotal_data: Mapped[str] = mapped_column(Text, default="{}")  # JSON

    # Lifecycle
    status: Mapped[AssetStatus] = mapped_column(
        SAEnum(AssetStatus), default=AssetStatus.active
    )
    first_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )
    last_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )
    last_scanned: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Related scan
    discovered_in_scan: Mapped[str | None] = mapped_column(String, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    # Relationships
    organization = relationship("Organization", back_populates="assets")
    asm_events = relationship(
        "ASMEvent", back_populates="asset", cascade="all, delete-orphan"
    )
    diffs = relationship(
        "AttackSurfaceDiff", back_populates="asset", cascade="all, delete-orphan"
    )

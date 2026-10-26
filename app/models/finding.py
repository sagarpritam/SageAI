"""
SageAI 2.0 — Finding Model
Stores individual vulnerability findings linked to scans.
"""

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class FindingSeverity(str, enum.Enum):
    critical = "Critical"
    high = "High"
    medium = "Medium"
    low = "Low"
    info = "Info"


class FindingStatus(str, enum.Enum):
    new = "new"
    confirmed = "confirmed"
    in_progress = "in_progress"
    fixed = "fixed"
    accepted_risk = "accepted_risk"
    reopened = "reopened"


class Finding(Base):
    __tablename__ = "findings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    scan_id: Mapped[str] = mapped_column(
        String, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Core details
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[FindingSeverity] = mapped_column(
        SAEnum(FindingSeverity), default=FindingSeverity.low, nullable=False, index=True
    )
    cvss_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Lifecycle management
    status: Mapped[FindingStatus] = mapped_column(
        SAEnum(FindingStatus), default=FindingStatus.new, nullable=False, index=True
    )
    assigned_to: Mapped[Optional[str]] = mapped_column(
        String, nullable=True
    )  # User email or ID
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Context
    asset_identified: Mapped[Optional[str]] = mapped_column(
        String, nullable=True
    )  # URL, endpoint, or IP where found
    remediation_steps: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # Markdown instructions for fix

    # Optional metadata (JSON stored as text)
    evidence: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # Raw request/response snippet

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    # Relationship
    scan = relationship("Scan", back_populates="db_findings")

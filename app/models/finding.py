"""
SageAI 2.0 — Finding Model
Stores individual vulnerability findings linked to scans.
"""

import enum

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class FindingSeverity(str, enum.Enum):
    critical = "Critical"
    high = "High"
    medium = "Medium"
    low = "Low"
    info = "Info"


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String, primary_key=True, default=generate_uuid)
    scan_id = Column(
        String, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Core details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(
        SAEnum(FindingSeverity), default=FindingSeverity.low, nullable=False, index=True
    )
    cvss_score = Column(Float, nullable=True)

    # Context
    asset_identified = Column(String, nullable=True)  # URL, endpoint, or IP where found
    remediation_steps = Column(Text, nullable=True)  # Markdown instructions for fix

    # Optional metadata (JSON stored as text)
    evidence = Column(Text, nullable=True)  # Raw request/response snippet

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationship
    scan = relationship("Scan", back_populates="db_findings")

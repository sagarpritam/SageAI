"""
SageAI 2.0 — Finding Model
Stores individual vulnerability findings linked to scans.
"""
import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship

from app.core.database import Base


class FindingSeverity(str, enum.Enum):
    critical = "Critical"
    high = "High"
    medium = "Medium"
    low = "Low"
    info = "Info"


class Finding(Base):
    __tablename__ = "findings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)

    # Core details
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(SAEnum(FindingSeverity), default=FindingSeverity.low, nullable=False, index=True)
    cvss_score = Column(Float, nullable=True)

    # Context
    asset_identified = Column(String, nullable=True)  # URL, endpoint, or IP where found
    remediation_steps = Column(Text, nullable=True)   # Markdown instructions for fix

    # Optional metadata (JSON stored as text)
    evidence = Column(Text, nullable=True)  # Raw request/response snippet

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    scan = relationship("Scan", backref="db_findings")

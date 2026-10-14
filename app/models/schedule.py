"""Scheduled scan model."""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship, synonym

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class ScanSchedule(Base):
    __tablename__ = "scan_schedules"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    org_id = synonym("organization_id")
    created_by = Column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    target = Column(String, nullable=False)
    frequency = Column(
        String, nullable=False, default="weekly"
    )  # daily, weekly, monthly
    is_active = Column(Boolean, default=True)
    last_run_at = Column(DateTime(timezone=True), nullable=True)
    next_run_at = Column(DateTime(timezone=True), nullable=True)
    run_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    organization = relationship("Organization", back_populates="schedules")
    creator = relationship("User", back_populates="schedules")

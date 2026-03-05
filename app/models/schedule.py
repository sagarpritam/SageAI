"""Scheduled scan model."""

from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class ScanSchedule(Base):
    __tablename__ = "scan_schedules"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    target = Column(String, nullable=False)
    frequency = Column(String, nullable=False, default="weekly")  # daily, weekly, monthly
    is_active = Column(Boolean, default=True)
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)
    run_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

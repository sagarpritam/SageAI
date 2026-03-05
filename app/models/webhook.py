"""Webhook model for scan notifications."""

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class Webhook(Base):
    __tablename__ = "webhooks"

    id = Column(String, primary_key=True, default=generate_uuid)
    url = Column(String, nullable=False)
    event = Column(String, nullable=False, default="scan.completed")  # scan.completed, scan.failed
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    secret = Column(String, nullable=False)  # For HMAC signature verification
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

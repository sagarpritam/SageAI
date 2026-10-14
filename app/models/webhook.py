"""Webhook model for scan notifications."""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship, synonym

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class Webhook(Base):
    __tablename__ = "webhooks"

    id = Column(String, primary_key=True, default=generate_uuid)
    url = Column(String, nullable=False)
    event = Column(
        String, nullable=False, default="scan.completed"
    )  # scan.completed, scan.failed
    organization_id = Column(
        String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    org_id = synonym("organization_id")
    secret = Column(String, nullable=False)  # For HMAC signature verification
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    organization = relationship("Organization", back_populates="webhooks")

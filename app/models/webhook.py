"""Webhook model for scan notifications."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class Webhook(Base):
    __tablename__ = "webhooks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    url: Mapped[str] = mapped_column(String, nullable=False)
    event: Mapped[str] = mapped_column(
        String, nullable=False, default="scan.completed"
    )  # scan.completed, scan.failed, asm.alert
    organization_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    org_id = synonym("organization_id")
    secret: Mapped[str] = mapped_column(
        String, nullable=False
    )  # For HMAC signature verification
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    # Relationships
    organization = relationship("Organization", back_populates="webhooks")

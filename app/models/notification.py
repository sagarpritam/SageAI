"""NotificationChannel model for multi-channel alerting (Slack, Discord, Teams, Email)."""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class NotificationChannel(Base):
    """Configuration for an alert destination channel (Slack, Discord, Teams, etc.)."""

    __tablename__ = "notification_channels"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    channel_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # slack, discord, msteams, email, webhook
    webhook_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    min_severity: Mapped[str] = mapped_column(
        String(20), default="high"
    )  # info, low, medium, high, critical
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now
    )

    # Relationships
    organization = relationship("Organization", back_populates="notification_channels")

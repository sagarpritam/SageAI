"""Notification models for outbound channels (Slack/Discord/Teams/Email) and in-app inbox."""

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class NotificationChannel(Base):
    """Configuration for an alert destination channel (Slack, Discord, Teams, etc.)."""

    __tablename__ = "notification_channels"
    __table_args__ = (
        UniqueConstraint("organization_id", "name", name="uq_org_notification_name"),
    )

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


class Notification(Base):
    """In-app organization security & operational notification inbox item."""

    __tablename__ = "notifications"
    __table_args__ = (
        UniqueConstraint(
            "organization_id", "source_ref", name="uq_org_notification_source_ref"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    organization_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    source_ref: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="security_alert"
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False, default="")
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, index=True
    )

    organization = relationship("Organization")

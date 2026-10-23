from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    org_id = synonym("id")
    name: Mapped[str] = mapped_column(String, nullable=False)
    plan: Mapped[str] = mapped_column(String, default="free")  # free / pro / enterprise
    github_token_encrypted: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    require_verified_domains: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # DevSecOps CI Quality Gate Policy
    ci_fail_on_critical: Mapped[bool] = mapped_column(Boolean, default=True)
    ci_fail_on_high: Mapped[bool] = mapped_column(Boolean, default=True)
    ci_auto_remediate: Mapped[bool] = mapped_column(Boolean, default=False)

    # Stripe Integration
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String, nullable=True, unique=True)
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(String, nullable=True, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    audit_logs = relationship(
        "AuditLog", back_populates="organization", cascade="all, delete-orphan"
    )
    users = relationship(
        "User", back_populates="organization", cascade="all, delete-orphan"
    )
    scans = relationship(
        "Scan", back_populates="organization", cascade="all, delete-orphan"
    )
    assets = relationship(
        "Asset", back_populates="organization", cascade="all, delete-orphan"
    )
    asm_events = relationship(
        "ASMEvent", back_populates="organization", cascade="all, delete-orphan"
    )
    attack_surface_diffs = relationship(
        "AttackSurfaceDiff", back_populates="organization", cascade="all, delete-orphan"
    )
    api_keys = relationship(
        "APIKey", back_populates="organization", cascade="all, delete-orphan"
    )
    webhooks = relationship(
        "Webhook", back_populates="organization", cascade="all, delete-orphan"
    )
    notification_channels = relationship(
        "NotificationChannel",
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    schedules = relationship(
        "ScanSchedule", back_populates="organization", cascade="all, delete-orphan"
    )

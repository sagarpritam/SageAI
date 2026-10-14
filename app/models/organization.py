from sqlalchemy import Column, DateTime, String
from sqlalchemy.orm import relationship, synonym

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = synonym("id")
    name = Column(String, nullable=False)
    plan = Column(String, default="free")  # free / pro / enterprise
    github_token_encrypted = Column(String, nullable=True)

    # Stripe Integration
    stripe_customer_id = Column(String, nullable=True, unique=True)
    stripe_subscription_id = Column(String, nullable=True, unique=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
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
    schedules = relationship(
        "ScanSchedule", back_populates="organization", cascade="all, delete-orphan"
    )

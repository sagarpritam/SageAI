from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship, synonym

from app.core.database import Base
from app.models.role import RoleEnum
from app.utils.helpers import generate_uuid, utc_now


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default=RoleEnum.MEMBER.value)

    # MFA
    mfa_secret = Column(String, nullable=True)
    mfa_enabled = Column(Boolean, default=False)
    mfa_backup_codes = Column(String, nullable=True)

    organization_id = Column(
        String, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    org_id = synonym("organization_id")

    created_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    organization = relationship("Organization", back_populates="users")
    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    api_keys = relationship("APIKey", back_populates="creator", cascade="all, delete-orphan")
    schedules = relationship("ScanSchedule", back_populates="creator", cascade="all, delete-orphan")

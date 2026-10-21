"""SageAI 2.0 — Audit Log Model.

Tamper-evident audit logging for enterprise compliance, access tracking,
and security state transitions.
"""

from sqlalchemy import Column, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        String,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    action = Column(
        String, nullable=False, index=True
    )  # e.g. ASSET_VERIFIED, SCAN_STARTED, POLICY_UPDATED
    resource_type = Column(
        String, nullable=False, index=True
    )  # e.g. scan, asset, finding, policy, channel
    resource_id = Column(String, nullable=True, index=True)
    details = Column(Text, default="{}")  # JSON string metadata
    ip_address = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)

    # Relationships
    organization = relationship("Organization", back_populates="audit_logs")
    user = relationship("User")

    __table_args__ = (
        Index("ix_audit_org_action_date", "organization_id", "action", "created_at"),
    )

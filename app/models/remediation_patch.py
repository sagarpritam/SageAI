"""SageAI 2.0 — Remediation Patch Model.

Stores proposed, approved, and applied AI code patches for Phase 04 SagePatch engine.
Supports human approval workflows, sandboxed validation results, and deterministic diff tracking.
"""

import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class PatchStatus(str, enum.Enum):
    proposed = "proposed"
    approved = "approved"
    rejected = "rejected"
    applied = "applied"
    failed = "failed"


class RemediationPatch(Base):
    __tablename__ = "remediation_patches"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    finding_id = Column(
        String,
        ForeignKey("findings.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    repository = Column(String, nullable=False, index=True)  # owner/repo
    base_branch = Column(String, default="main", nullable=False)
    patch_branch = Column(String, nullable=False)  # sagepatch/fix-xxx
    file_path = Column(String, nullable=False)

    vulnerability_type = Column(String, nullable=False)
    severity = Column(String, default="MEDIUM", nullable=False)

    original_code = Column(Text, nullable=False)
    patched_code = Column(Text, nullable=False)
    diff = Column(Text, nullable=False)  # Deterministic unified diff
    lines_changed = Column(Integer, default=0, nullable=False)

    status = Column(
        SAEnum(PatchStatus),
        default=PatchStatus.proposed,
        nullable=False,
        index=True,
    )

    # Sandboxed validation results
    sandbox_passed = Column(Boolean, default=False, nullable=False)
    sandbox_details = Column(Text, default="{}")  # JSON string

    # Human approval tracking
    requested_by = Column(String, nullable=False)  # User email or ID
    approved_by = Column(String, nullable=True)  # User email who approved
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # GitHub Pull Request metadata
    pr_number = Column(Integer, nullable=True)
    pr_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    organization = relationship("Organization")
    finding = relationship("Finding")

    __table_args__ = (
        Index("ix_patch_org_status", "organization_id", "status"),
        Index("ix_patch_repo_branch", "repository", "patch_branch"),
    )

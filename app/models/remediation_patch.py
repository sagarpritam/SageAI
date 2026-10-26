"""SageAI 2.0 — Remediation Patch Model.

Stores proposed, approved, and applied AI code patches for Phase 04 SagePatch engine.
Supports human approval workflows, sandboxed validation results, and deterministic diff tracking.
"""

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

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

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    finding_id: Mapped[Optional[str]] = mapped_column(
        String,
        ForeignKey("findings.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    repository: Mapped[str] = mapped_column(
        String, nullable=False, index=True
    )  # owner/repo
    base_branch: Mapped[str] = mapped_column(String, default="main", nullable=False)
    patch_branch: Mapped[str] = mapped_column(
        String, nullable=False
    )  # sagepatch/fix-xxx
    file_path: Mapped[str] = mapped_column(String, nullable=False)

    vulnerability_type: Mapped[str] = mapped_column(String, nullable=False)
    severity: Mapped[str] = mapped_column(String, default="MEDIUM", nullable=False)

    original_code: Mapped[str] = mapped_column(Text, nullable=False)
    patched_code: Mapped[str] = mapped_column(Text, nullable=False)
    diff: Mapped[str] = mapped_column(
        Text, nullable=False
    )  # Deterministic unified diff
    lines_changed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    status: Mapped[PatchStatus] = mapped_column(
        SAEnum(PatchStatus),
        default=PatchStatus.proposed,
        nullable=False,
        index=True,
    )

    # Sandboxed validation results
    sandbox_passed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sandbox_details: Mapped[str] = mapped_column(Text, default="{}")  # JSON string

    # Human approval tracking
    requested_by: Mapped[str] = mapped_column(
        String, nullable=False
    )  # User email or ID
    approved_by: Mapped[Optional[str]] = mapped_column(
        String, nullable=True
    )  # User email who approved
    approved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # GitHub Pull Request metadata
    pr_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    pr_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    # Relationships
    organization = relationship("Organization")
    finding = relationship("Finding")

    __table_args__ = (
        Index("ix_patch_org_status", "organization_id", "status"),
        Index("ix_patch_repo_branch", "repository", "patch_branch"),
    )

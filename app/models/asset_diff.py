"""
SageAI 2.0 — Attack Surface Diff Model
Stores historical changes between two scans or states for an asset.
"""

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship, synonym

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class AttackSurfaceDiff(Base):
    """Tracks incremental changes (diffs) to an asset's attack surface over time."""

    __tablename__ = "attack_surface_diffs"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    org_id = synonym("organization_id")
    asset_id = Column(
        String, ForeignKey("assets.id", ondelete="CASCADE"), nullable=True, index=True
    )

    # Store IDs of compared scans
    previous_scan_id = Column(
        String, ForeignKey("scans.id", ondelete="SET NULL"), nullable=True
    )
    current_scan_id = Column(
        String, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False
    )

    # Diffs (stored as JSON encoded strings)
    # e.g. {"added": [8080], "removed": [80]}
    ports_diff = Column(Text, default='{"added": [], "removed": []}')

    # e.g. {"new_cves": ["CVE-2024-1234"], "resolved_cves": ["CVE-2023-4567"]}
    vulnerabilities_diff = Column(Text, default='{"new_cves": [], "resolved_cves": []}')

    # e.g. {"added": ["dev.example.com"], "removed": []}
    subdomains_diff = Column(Text, default='{"added": [], "removed": []}')

    # Generic schema diffs (technologies, DNS records passing, etc)
    technologies_diff = Column(Text, default='{"added": [], "removed": []}')
    overall_risk_shift = Column(
        String, default="nc"
    )  # "increased", "decreased", "nc" (no change)

    # Metadata
    created_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    organization = relationship("Organization", back_populates="attack_surface_diffs")
    asset = relationship("Asset", back_populates="diffs")
    current_scan = relationship("Scan", foreign_keys=[current_scan_id])
    previous_scan = relationship("Scan", foreign_keys=[previous_scan_id])

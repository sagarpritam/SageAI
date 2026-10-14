"""
SageAI 2.0 — Security Knowledge Graph Models
Defines graph nodes and edges for attack path analysis.
"""

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import synonym

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class GraphNode(Base):
    """Represents a node in the security knowledge graph."""

    __tablename__ = "kg_nodes"

    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    organization_id = synonym("org_id")

    node_type = Column(
        String, nullable=False, index=True
    )  # asset | technology | vulnerability | cve | network_zone
    label = Column(String, nullable=False)  # human-readable name
    properties = Column(Text, default="{}")  # JSON blob
    risk_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )


class GraphEdge(Base):
    """Represents a directed edge between two graph nodes."""

    __tablename__ = "kg_edges"

    id = Column(String, primary_key=True, default=generate_uuid)
    org_id = Column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    organization_id = synonym("org_id")

    source_id = Column(String, nullable=False, index=True)  # FK to kg_nodes.id
    target_id = Column(String, nullable=False, index=True)  # FK to kg_nodes.id
    edge_type = Column(
        String, nullable=False
    )  # HOSTS | RUNS | HAS_VULN | LEADS_TO | EXPOSES
    weight = Column(Float, default=1.0)  # higher = more dangerous path
    properties = Column(Text, default="{}")
    created_at = Column(DateTime(timezone=True), default=utc_now)

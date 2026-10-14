"""
SageAI 2.0 — Agent Log Model
Stores reasoning trail for the multi-agent system execution.
"""

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    scan_id = Column(
        String, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True
    )

    agent_name = Column(String, nullable=False)  # e.g. ReconAgent, ScannerAgent
    action_text = Column(String, nullable=False)  # e.g. "Discovered 12 subdomains"
    details = Column(Text, nullable=True)  # Optional long text / JSON

    timestamp = Column(DateTime(timezone=True), default=utc_now)

    # Relationship
    scan = relationship("Scan", back_populates="agent_logs")

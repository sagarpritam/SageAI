"""
SageAI 2.0 — Agent Log Model
Stores reasoning trail for the multi-agent system execution.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String, ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)

    agent_name = Column(String, nullable=False)  # e.g. ReconAgent, ScannerAgent
    action_text = Column(String, nullable=False) # e.g. "Discovered 12 subdomains"
    details = Column(Text, nullable=True)        # Optional long text / JSON

    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship
    scan = relationship("Scan", backref="agent_logs")

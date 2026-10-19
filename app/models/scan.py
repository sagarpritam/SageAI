import json

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym

from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class Scan(Base):
    __tablename__ = "scans"

    id = Column(String, primary_key=True, default=generate_uuid)

    organization_id = Column(
        String,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    org_id = synonym("organization_id")
    user_id = Column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    target = Column(String, nullable=False)
    findings: Mapped[str] = mapped_column(Text, default="[]")  # JSON stored as text for SQLite compat
    risk_score = Column(Integer, default=0)
    risk_level = Column(String, default="Low")
    status = Column(String, default="pending")  # pending / running / completed / failed
    share_token = Column(String, unique=True, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    organization = relationship("Organization", back_populates="scans")
    user = relationship("User", back_populates="scans")
    db_findings = relationship(
        "Finding", back_populates="scan", cascade="all, delete-orphan"
    )
    agent_logs = relationship(
        "AgentLog", back_populates="scan", cascade="all, delete-orphan"
    )
    asm_events = relationship("ASMEvent", back_populates="scan")

    def set_findings(self, data: list):
        """Serialize findings list to JSON string."""
        self.findings = json.dumps(data)

    def get_findings(self) -> list:
        """Deserialize findings from JSON string."""
        return json.loads(self.findings) if self.findings else []

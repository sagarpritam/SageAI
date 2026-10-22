import json

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
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
    scan_type = Column(String, default="full", nullable=False)
    findings: Mapped[str] = mapped_column(
        Text, default="[]"
    )  # JSON stored as text for SQLite compat
    risk_score = Column(Integer, default=0)
    risk_level = Column(String, default="Low")
    status = Column(String, default="pending")  # pending / queued / running / completed / failed / cancelled
    stage = Column(String, default="init", nullable=True)  # init / dns / ports / osint / nuclei / complete
    progress = Column(Integer, default=0, nullable=False)  # 0 to 100
    retry_count = Column(Integer, default=0, nullable=False)
    idempotency_key = Column(String, nullable=True, index=True)
    celery_task_id = Column(String, nullable=True)
    share_token = Column(String, unique=True, nullable=True)
    is_authorized = Column(Boolean, default=False, nullable=False)

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

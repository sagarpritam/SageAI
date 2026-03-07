import uuid
import json
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Scan(Base):
    __tablename__ = "scans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    target = Column(String, nullable=False)
    findings = Column(Text, default="[]")  # JSON stored as text for SQLite compat
    risk_score = Column(Integer, default=0)
    risk_level = Column(String, default="Low")
    status = Column(String, default="pending")  # pending / running / completed / failed

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="scans")
    user = relationship("User", back_populates="scans")

    def set_findings(self, data: list):
        """Serialize findings list to JSON string."""
        self.findings = json.dumps(data)

    def get_findings(self) -> list:
        """Deserialize findings from JSON string."""
        return json.loads(self.findings) if self.findings else []

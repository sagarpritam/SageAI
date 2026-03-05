"""API Key model for external integrations."""

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from app.core.database import Base
from app.utils.helpers import generate_uuid, utc_now


class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, default=generate_uuid)
    key = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

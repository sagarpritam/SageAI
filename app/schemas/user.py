from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime


class UserOut(BaseModel):
    """Public user representation (no password hash)."""

    id: str
    email: EmailStr
    role: str
    organization_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    """Fields that can be updated on a user."""

    email: EmailStr | None = None
    role: str | None = None

"""Pydantic schemas for Notification Channels."""

from datetime import datetime
from typing import Literal, Optional
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, Field, field_serializer


def mask_webhook_url(url: str) -> str:
    """Mask sensitive webhook URL tokens while keeping the host visible for identification."""
    if not url:
        return ""
    try:
        parsed = urlparse(url)
        path = parsed.path
        if len(path) > 10:
            masked_path = path[:6] + "/...****" + path[-4:]
        else:
            masked_path = "/...****"
        query_part = "?****" if parsed.query else ""
        return f"{parsed.scheme}://{parsed.netloc}{masked_path}{query_part}"
    except Exception:
        return "https://****"


class NotificationChannelBase(BaseModel):
    name: str = Field(
        ..., min_length=2, max_length=100, description="Display name for the channel"
    )
    channel_type: Literal["slack", "discord", "msteams", "webhook", "email"] = Field(
        ..., description="Type of notification destination"
    )
    webhook_url: str = Field(
        ..., max_length=1000, description="Destination Webhook or API URL"
    )
    min_severity: Literal["info", "low", "medium", "high", "critical"] = Field(
        default="high",
        description="Minimum severity threshold required to trigger alerts",
    )


class NotificationChannelCreate(NotificationChannelBase):
    pass


class NotificationChannelUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    channel_type: Optional[
        Literal["slack", "discord", "msteams", "webhook", "email"]
    ] = None
    webhook_url: Optional[str] = Field(None, max_length=1000)
    min_severity: Optional[Literal["info", "low", "medium", "high", "critical"]] = None
    is_active: Optional[bool] = None


class NotificationChannelResponse(NotificationChannelBase):
    id: str
    organization_id: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_serializer("webhook_url")
    def serialize_webhook_url(self, webhook_url: str) -> str:
        return mask_webhook_url(webhook_url)


class NotificationTestResponse(BaseModel):
    success: bool
    message: str


class NotificationItemResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationMarkReadResponse(BaseModel):
    ok: bool
    id: int
    is_read: bool

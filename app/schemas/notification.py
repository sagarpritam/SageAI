"""Pydantic schemas for Notification Channels."""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


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


class NotificationTestResponse(BaseModel):
    success: bool
    message: str

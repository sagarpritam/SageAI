"""API routes for managing organization Notification Channels (Slack, Discord, Teams, Webhook)."""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.models.notification import NotificationChannel
from app.routers.webhook_routes import is_safe_webhook_url
from app.schemas.notification import (
    NotificationChannelCreate,
    NotificationChannelResponse,
    NotificationChannelUpdate,
    NotificationTestResponse,
)
from app.services.alerting.dispatcher import send_to_channel
from app.services.audit_service import log_audit_event

logger = logging.getLogger("SageAI.notifications")
router = APIRouter(prefix="/notifications/channels", tags=["Notifications"])


@router.get("", response_model=List[NotificationChannelResponse])
@limiter.limit("60/minute")
async def list_notification_channels(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all notification channels configured for the user's organization."""
    stmt = (
        select(NotificationChannel)
        .where(NotificationChannel.organization_id == current_user["org"])
        .order_by(NotificationChannel.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "", response_model=NotificationChannelResponse, status_code=status.HTTP_201_CREATED
)
@limiter.limit("30/minute")
async def create_notification_channel(
    request: Request,
    payload: NotificationChannelCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new notification channel for the organization with SSRF check."""
    is_safe, error_msg = is_safe_webhook_url(payload.webhook_url)
    if not is_safe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid webhook URL: {error_msg}",
        )

    channel = NotificationChannel(
        organization_id=current_user["org"],
        name=payload.name,
        channel_type=payload.channel_type,
        webhook_url=payload.webhook_url.strip(),
        min_severity=payload.min_severity,
        is_active=True,
    )
    db.add(channel)
    await db.commit()
    await db.refresh(channel)

    await log_audit_event(
        db=db,
        organization_id=current_user["org"],
        user_id=current_user.get("sub"),
        action="CHANNEL_CREATED",
        resource_type="notification_channel",
        resource_id=channel.id,
        details={"name": channel.name, "type": channel.channel_type},
    )

    logger.info(
        f"Created notification channel '{channel.name}' ({channel.channel_type}) for org '{current_user['org']}'"
    )
    return channel


@router.get("/{channel_id}", response_model=NotificationChannelResponse)
@limiter.limit("60/minute")
async def get_notification_channel(
    request: Request,
    channel_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve details for a specific notification channel."""
    stmt = select(NotificationChannel).where(
        NotificationChannel.id == channel_id,
        NotificationChannel.organization_id == current_user["org"],
    )
    result = await db.execute(stmt)
    channel = result.scalar_one_or_none()
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found"
        )
    return channel


@router.patch("/{channel_id}", response_model=NotificationChannelResponse)
@limiter.limit("30/minute")
async def update_notification_channel(
    request: Request,
    channel_id: str,
    payload: NotificationChannelUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a notification channel configuration."""
    stmt = select(NotificationChannel).where(
        NotificationChannel.id == channel_id,
        NotificationChannel.organization_id == current_user["org"],
    )
    result = await db.execute(stmt)
    channel = result.scalar_one_or_none()
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found"
        )

    if payload.webhook_url is not None and "****" not in payload.webhook_url:
        is_safe, error_msg = is_safe_webhook_url(payload.webhook_url)
        if not is_safe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid webhook URL: {error_msg}",
            )
        channel.webhook_url = payload.webhook_url.strip()

    if payload.name is not None:
        channel.name = payload.name
    if payload.channel_type is not None:
        channel.channel_type = payload.channel_type
    if payload.min_severity is not None:
        channel.min_severity = payload.min_severity
    if payload.is_active is not None:
        channel.is_active = payload.is_active

    await db.commit()
    await db.refresh(channel)

    await log_audit_event(
        db=db,
        organization_id=current_user["org"],
        user_id=current_user.get("sub"),
        action="CHANNEL_UPDATED",
        resource_type="notification_channel",
        resource_id=channel.id,
        details={"name": channel.name, "type": channel.channel_type},
    )

    return channel


@router.delete("/{channel_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
async def delete_notification_channel(
    request: Request,
    channel_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a notification channel."""
    stmt = select(NotificationChannel).where(
        NotificationChannel.id == channel_id,
        NotificationChannel.organization_id == current_user["org"],
    )
    result = await db.execute(stmt)
    channel = result.scalar_one_or_none()
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found"
        )

    await db.delete(channel)
    await db.commit()

    await log_audit_event(
        db=db,
        organization_id=current_user["org"],
        user_id=current_user.get("sub"),
        action="CHANNEL_DELETED",
        resource_type="notification_channel",
        resource_id=channel_id,
    )

    return None


@router.post("/{channel_id}/test", response_model=NotificationTestResponse)
@limiter.limit("10/minute")
async def test_notification_channel(
    request: Request,
    channel_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a test security alert to verify channel connectivity."""
    stmt = select(NotificationChannel).where(
        NotificationChannel.id == channel_id,
        NotificationChannel.organization_id == current_user["org"],
    )
    result = await db.execute(stmt)
    channel = result.scalar_one_or_none()
    if not channel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Channel not found"
        )

    success = await send_to_channel(
        channel=channel,
        title="Test Notification from SageAI",
        target="https://sageai-demo.local",
        severity="info",
        risk_score=10.0,
        details="This is a test notification confirming that your alerting integration is working properly.",
        findings_count=1,
    )

    if success:
        return NotificationTestResponse(
            success=True, message="Test alert dispatched successfully!"
        )
    else:
        return NotificationTestResponse(
            success=False,
            message="Test alert delivery failed. Please verify the Webhook URL and channel permissions.",
        )

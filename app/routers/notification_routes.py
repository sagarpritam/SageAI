"""API routes for managing organization Notification Channels (Slack, Discord, Teams, Webhook)
and the in-app security & operational notification inbox."""

import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.security import get_current_user
from app.models.notification import Notification, NotificationChannel
from app.models.remediation_patch import RemediationPatch
from app.models.scan import Scan
from app.routers.webhook_routes import is_safe_webhook_url
from app.schemas.notification import (
    NotificationChannelCreate,
    NotificationChannelResponse,
    NotificationChannelUpdate,
    NotificationItemResponse,
    NotificationMarkReadResponse,
    NotificationTestResponse,
)
from app.services.alerting.dispatcher import send_to_channel
from app.services.audit_service import log_audit_event
from app.services.incident_response.soar_engine import soar_engine
from app.utils.helpers import utc_now

logger = logging.getLogger("SageAI.notifications")
router = APIRouter(prefix="/notifications/channels", tags=["Notifications"])
inbox_router = APIRouter(prefix="/notifications", tags=["Notifications"])


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


def _parse_iso_datetime(value: object) -> datetime:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, str) and value:
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except ValueError:
            pass
    return utc_now()


async def _sync_org_notifications(org_id: str, db: AsyncSession) -> None:
    """Idempotently populate in-app notifications from scans, autofix patches, and SOAR incidents."""
    existing_stmt = select(Notification.source_ref).where(
        Notification.organization_id == org_id
    )
    existing_refs = set((await db.execute(existing_stmt)).scalars().all())
    added = False

    scans_stmt = (
        select(Scan)
        .where(
            Scan.organization_id == org_id,
            Scan.status.in_(["completed", "failed"]),
        )
        .order_by(Scan.created_at.desc())
        .limit(10)
    )
    for scan in (await db.execute(scans_stmt)).scalars().all():
        source_ref = f"scan:{scan.id}:{scan.status}"
        if source_ref in existing_refs:
            continue
        existing_refs.add(source_ref)
        notif_type = "scan_completed" if scan.status == "completed" else "scan_failed"
        title = (
            f"Scan completed: {scan.target}"
            if scan.status == "completed"
            else f"Scan failed: {scan.target}"
        )
        message = (
            f"Risk score {scan.risk_score} ({scan.risk_level}) · {scan.scan_type} scan"
        )
        db.add(
            Notification(
                organization_id=org_id,
                source_ref=source_ref,
                type=notif_type,
                title=title[:200],
                message=message,
                is_read=False,
                created_at=scan.created_at or utc_now(),
            )
        )
        added = True

    patches_stmt = (
        select(RemediationPatch)
        .where(RemediationPatch.organization_id == org_id)
        .order_by(RemediationPatch.created_at.desc())
        .limit(10)
    )
    for patch in (await db.execute(patches_stmt)).scalars().all():
        patch_status = (
            patch.status.value if hasattr(patch.status, "value") else str(patch.status)
        )
        source_ref = f"patch:{patch.id}:{patch_status}"
        if source_ref in existing_refs:
            continue
        existing_refs.add(source_ref)
        db.add(
            Notification(
                organization_id=org_id,
                source_ref=source_ref,
                type="autofix",
                title=f"AutoFix {patch_status}: {patch.file_path}"[:200],
                message=f"{patch.vulnerability_type} ({patch.severity}) in {patch.repository}",
                is_read=False,
                created_at=patch.created_at or utc_now(),
            )
        )
        added = True

    for incident in soar_engine.list_incidents(limit=10, org_id=org_id):
        if incident.get("org_id") != org_id:
            continue
        incident_id = incident.get("incident_id", "")
        if not incident_id:
            continue
        source_ref = f"incident:{incident_id}"
        if source_ref in existing_refs:
            continue
        existing_refs.add(source_ref)
        severity = incident.get("severity", "HIGH")
        source = incident.get("source", "SOAR")
        db.add(
            Notification(
                organization_id=org_id,
                source_ref=source_ref,
                type="security_alert",
                title=f"[{severity}] {incident.get('title', 'Security Incident')}"[
                    :200
                ],
                message=f"Source: {source} · Status: {incident.get('status', 'OPEN')}",
                is_read=False,
                created_at=_parse_iso_datetime(incident.get("created_at")),
            )
        )
        added = True

    if added:
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()


@inbox_router.get("", response_model=List[NotificationItemResponse])
@limiter.limit("60/minute")
async def list_notifications(
    request: Request,
    limit: int = 30,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List recent security, scan, and AutoFix notifications for the user's organization."""
    org_id = current_user["org"]
    await _sync_org_notifications(org_id, db)

    clamped_limit = max(1, min(limit, 100))
    stmt = (
        select(Notification)
        .where(Notification.organization_id == org_id)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
        .limit(clamped_limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


@inbox_router.post(
    "/{notification_id}/read", response_model=NotificationMarkReadResponse
)
@limiter.limit("60/minute")
async def mark_notification_read(
    request: Request,
    notification_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark an organization notification as read."""
    stmt = select(Notification).where(
        Notification.id == notification_id,
        Notification.organization_id == current_user["org"],
    )
    result = await db.execute(stmt)
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )

    notification.is_read = True
    await db.commit()
    return NotificationMarkReadResponse(ok=True, id=notification.id, is_read=True)


@inbox_router.post("/read-all")
@limiter.limit("30/minute")
async def mark_all_notifications_read(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark all unread notifications in the organization as read."""
    stmt = (
        update(Notification)
        .where(
            Notification.organization_id == current_user["org"],
            Notification.is_read.is_(False),
        )
        .values(is_read=True)
    )
    await db.execute(stmt)
    await db.commit()
    return {"ok": True}

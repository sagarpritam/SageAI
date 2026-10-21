from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.asm_event import ASMEvent, ASMEventSeverity, ASMEventType
from app.services.asm.alerting import dispatch_unnotified_events

router = APIRouter(prefix="/api/asm", tags=["ASM"])


def _serialize_asm_event(evt: ASMEvent) -> dict:
    return {
        "id": evt.id,
        "asset_id": evt.asset_id,
        "scan_id": evt.scan_id,
        "event_type": evt.event_type.value
        if hasattr(evt.event_type, "value")
        else str(evt.event_type),
        "severity": evt.severity.value
        if hasattr(evt.severity, "value")
        else str(evt.severity),
        "title": evt.title,
        "description": evt.description,
        "details": evt.details,
        "is_alert_sent": evt.is_alert_sent,
        "created_at": evt.created_at.isoformat() if evt.created_at else None,
    }


@router.get("/events")
async def get_asm_events(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    severity: str | None = None,
    event_type: str | None = None,
    asset_id: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch timeline of continuous ASM discovery events for an organization with optional filters."""
    org_id = current_user["org"]
    stmt = (
        select(ASMEvent)
        .where(ASMEvent.organization_id == org_id)
        .order_by(desc(ASMEvent.created_at))
    )

    if severity:
        try:
            sev_enum = ASMEventSeverity(severity.lower())
            stmt = stmt.where(ASMEvent.severity == sev_enum)
        except ValueError:
            pass

    if event_type:
        try:
            type_enum = ASMEventType(event_type.lower())
            stmt = stmt.where(ASMEvent.event_type == type_enum)
        except ValueError:
            pass

    if asset_id:
        stmt = stmt.where(ASMEvent.asset_id == asset_id)

    stmt = stmt.offset(offset).limit(limit)
    res = await db.execute(stmt)
    events = res.scalars().all()

    return [_serialize_asm_event(evt) for evt in events]


@router.get("/events/asset/{asset_id}")
async def get_asset_asm_events(
    asset_id: str,
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch all ASM events for a specific asset."""
    org_id = current_user["org"]
    stmt = (
        select(ASMEvent)
        .where(ASMEvent.organization_id == org_id, ASMEvent.asset_id == asset_id)
        .order_by(desc(ASMEvent.created_at))
        .limit(limit)
    )
    res = await db.execute(stmt)
    events = res.scalars().all()

    return [_serialize_asm_event(evt) for evt in events]


@router.get("/summary")
async def get_asm_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch aggregated summary metrics of ASM events for the organization."""
    org_id = current_user["org"]
    now = datetime.now(timezone.utc)
    one_day_ago = now - timedelta(hours=24)

    # Total events
    total_res = await db.execute(
        select(func.count(ASMEvent.id)).where(ASMEvent.organization_id == org_id)
    )
    total_events = total_res.scalar() or 0

    # Events in last 24h
    last_24h_res = await db.execute(
        select(func.count(ASMEvent.id)).where(
            ASMEvent.organization_id == org_id,
            ASMEvent.created_at >= one_day_ago,
        )
    )
    events_last_24h = last_24h_res.scalar() or 0

    # Severity breakdown
    sev_res = await db.execute(
        select(ASMEvent.severity, func.count(ASMEvent.id))
        .where(ASMEvent.organization_id == org_id)
        .group_by(ASMEvent.severity)
    )
    severity_counts = {s.value: 0 for s in ASMEventSeverity}
    for sev, count in sev_res.all():
        key = sev.value if hasattr(sev, "value") else str(sev)
        severity_counts[key] = count

    # Event type breakdown
    type_res = await db.execute(
        select(ASMEvent.event_type, func.count(ASMEvent.id))
        .where(ASMEvent.organization_id == org_id)
        .group_by(ASMEvent.event_type)
    )
    type_counts = {t.value: 0 for t in ASMEventType}
    for evt_type, count in type_res.all():
        key = evt_type.value if hasattr(evt_type, "value") else str(evt_type)
        type_counts[key] = count

    return {
        "total_events": total_events,
        "events_last_24h": events_last_24h,
        "by_severity": severity_counts,
        "by_event_type": type_counts,
    }


@router.post("/alerts/dispatch")
async def trigger_alerts_dispatch(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger dispatch of unnotified ASM events to webhooks on-demand."""
    dispatched = await dispatch_unnotified_events(db=db)
    return {"message": "Alert dispatch completed", "dispatched_count": dispatched}

"""Scheduled scan management routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import require_role
from app.models.schedule import ScanSchedule

router = APIRouter(prefix="/schedules", tags=["Scheduled Scans"])


@router.post("")
async def create_schedule(
    target: str,
    frequency: str = "weekly",
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Create a scheduled scan (admin only)."""
    if frequency not in ("daily", "weekly", "monthly"):
        raise HTTPException(status_code=400, detail="Frequency must be daily, weekly, or monthly")

    schedule = ScanSchedule(
        target=target,
        frequency=frequency,
        organization_id=current_user["org"],
        created_by=current_user["sub"],
    )
    db.add(schedule)
    await db.commit()
    return {"id": schedule.id, "target": target, "frequency": frequency, "is_active": True}


@router.get("")
async def list_schedules(
    current_user: dict = Depends(require_role("viewer")),
    db: AsyncSession = Depends(get_db),
):
    """List all scheduled scans for the organization."""
    result = await db.execute(
        select(ScanSchedule).where(ScanSchedule.organization_id == current_user["org"])
    )
    schedules = result.scalars().all()
    return [
        {
            "id": s.id, "target": s.target, "frequency": s.frequency,
            "is_active": s.is_active, "run_count": s.run_count,
            "last_run_at": s.last_run_at, "next_run_at": s.next_run_at,
        }
        for s in schedules
    ]


@router.delete("/{schedule_id}")
async def delete_schedule(
    schedule_id: str,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Delete a scheduled scan."""
    result = await db.execute(
        select(ScanSchedule).where(
            ScanSchedule.id == schedule_id,
            ScanSchedule.organization_id == current_user["org"],
        )
    )
    schedule = result.scalar_one_or_none()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    await db.delete(schedule)
    await db.commit()
    return {"message": "Schedule deleted"}

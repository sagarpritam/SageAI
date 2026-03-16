from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.asm_event import ASMEvent

router = APIRouter(prefix="/api/asm", tags=["ASM"])

@router.get("/events")
async def get_asm_events(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch timeline of continuous ASM discovery events for an organization."""
    org_id = current_user["org"]
    stmt = (
        select(ASMEvent)
        .where(ASMEvent.org_id == org_id)
        .order_by(desc(ASMEvent.created_at))
        .limit(limit)
    )
    res = await db.execute(stmt)
    events = res.scalars().all()
    
    return [
        {
            "id": evt.id,
            "event_type": evt.event_type.value,
            "severity": evt.severity.value,
            "title": evt.title,
            "description": evt.description,
            "details": evt.details,
            "created_at": evt.created_at.isoformat() if evt.created_at else None
        }
        for evt in events
    ]

@router.get("/events/asset/{asset_id}")
async def get_asset_asm_events(
    asset_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch all ASM events for a specific asset."""
    org_id = current_user["org"]
    stmt = (
        select(ASMEvent)
        .where(
            ASMEvent.org_id == org_id,
            ASMEvent.asset_id == asset_id
        )
        .order_by(desc(ASMEvent.created_at))
    )
    res = await db.execute(stmt)
    events = res.scalars().all()
    
    return [
        {
            "id": evt.id,
            "event_type": evt.event_type.value,
            "severity": evt.severity.value,
            "title": evt.title,
            "description": evt.description,
            "details": evt.details,
            "created_at": evt.created_at.isoformat() if evt.created_at else None
        }
        for evt in events
    ]

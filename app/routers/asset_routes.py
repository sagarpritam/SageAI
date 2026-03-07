"""
SageAI 2.0 — Asset Inventory Routes
REST API for Attack Surface Management.
"""
import json
import logging
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy import select, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.asset import Asset, AssetType, AssetStatus
from app.models.user import User
from app.schemas.asset import AssetOut, AssetSummary, DiscoveryRequest
from app.services.asset_inventory.asset_discovery_service import discover_assets

router = APIRouter(prefix="/assets", tags=["Asset Inventory"])
logger = logging.getLogger("sageai.asset_routes")


def _parse_asset(a: Asset) -> dict:
    return {
        "id": a.id,
        "org_id": a.org_id,
        "asset_type": a.asset_type,
        "value": a.value,
        "ip_address": a.ip_address,
        "open_ports": json.loads(a.open_ports or "[]"),
        "technologies": json.loads(a.technologies or "[]"),
        "http_status": a.http_status,
        "http_title": a.http_title,
        "risk_score": a.risk_score,
        "risk_level": a.risk_level,
        "status": a.status,
        "first_seen": a.first_seen.isoformat() if a.first_seen else None,
        "last_seen": a.last_seen.isoformat() if a.last_seen else None,
        "last_scanned": a.last_scanned.isoformat() if a.last_scanned else None,
        "discovered_in_scan": a.discovered_in_scan,
    }


@router.post("/discover", summary="Trigger Asset Discovery")
async def trigger_discovery(
    req: DiscoveryRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Trigger full attack surface discovery for a root domain.
    Runs the full pipeline: crt.sh → DNS → Shodan → HTTP probe → risk scoring → DB upsert.
    """
    org_id = current_user.org_id
    if not org_id:
        raise HTTPException(status_code=400, detail="User has no organization")

    # Run in background for large scans
    background_tasks.add_task(
        discover_assets, org_id, req.target, db, req.scan_id
    )
    return {
        "status": "discovery_started",
        "target": req.target,
        "message": f"Asset discovery started for {req.target}. Check /assets/summary for results.",
    }


@router.post("/discover/sync", summary="Trigger Asset Discovery (Synchronous)")
async def trigger_discovery_sync(
    req: DiscoveryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Synchronous asset discovery — waits for completion and returns full summary.
    Best for smaller target domains (< 20 subdomains).
    """
    org_id = current_user.org_id
    if not org_id:
        raise HTTPException(status_code=400, detail="User has no organization")

    try:
        summary = await discover_assets(org_id, req.target, db, req.scan_id)
        return summary
    except Exception as e:
        logger.error(f"Discovery failed: {e}")
        raise HTTPException(status_code=500, detail=f"Discovery failed: {str(e)}")


@router.get("/summary", summary="Get Asset Inventory Summary")
async def get_asset_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns aggregated counts for the organization's attack surface."""
    org_id = current_user.org_id
    result = await db.execute(select(Asset).where(Asset.org_id == org_id))
    assets = result.scalars().all()

    from datetime import timezone, timedelta
    now = datetime.now(timezone.utc)
    yesterday = now - timedelta(hours=24)

    def _to_dt(v):
        if v is None:
            return now
        if hasattr(v, "tzinfo") and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v

    return {
        "total": len(assets),
        "domains": sum(1 for a in assets if a.asset_type == AssetType.domain),
        "subdomains": sum(1 for a in assets if a.asset_type == AssetType.subdomain),
        "ips": sum(1 for a in assets if a.asset_type == AssetType.ip),
        "servers": sum(1 for a in assets if a.asset_type == AssetType.server),
        "apis": sum(1 for a in assets if a.asset_type == AssetType.api),
        "cloud_resources": sum(1 for a in assets if a.asset_type == AssetType.cloud_resource),
        "high_risk": sum(1 for a in assets if a.risk_level in ("High", "Critical")),
        "critical": sum(1 for a in assets if a.risk_level == "Critical"),
        "active": sum(1 for a in assets if a.status == AssetStatus.active),
        "stale": sum(1 for a in assets if a.status == AssetStatus.stale),
        "new_last_24h": sum(1 for a in assets if _to_dt(a.first_seen) >= yesterday),
    }


@router.get("", summary="List All Assets")
async def list_assets(
    asset_type: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List discovered assets with optional filtering by type, risk level, and status."""
    org_id = current_user.org_id
    q = select(Asset).where(Asset.org_id == org_id)

    if asset_type:
        q = q.where(Asset.asset_type == asset_type)
    if risk_level:
        q = q.where(Asset.risk_level == risk_level)
    if status:
        q = q.where(Asset.status == status)

    q = q.order_by(desc(Asset.risk_score)).offset(offset).limit(limit)
    result = await db.execute(q)
    assets = result.scalars().all()
    return [_parse_asset(a) for a in assets]


@router.get("/high-risk", summary="Get High Risk Assets")
async def get_high_risk_assets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return Critical and High risk assets sorted by risk score."""
    org_id = current_user.org_id
    result = await db.execute(
        select(Asset)
        .where(
            and_(Asset.org_id == org_id, Asset.risk_level.in_(["Critical", "High"]))
        )
        .order_by(desc(Asset.risk_score))
        .limit(50)
    )
    assets = result.scalars().all()
    return [_parse_asset(a) for a in assets]


@router.get("/new", summary="Recently Discovered Assets")
async def get_new_assets(
    hours: int = Query(24, ge=1, le=168),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Assets discovered in the last N hours."""
    from datetime import timezone, timedelta
    org_id = current_user.org_id
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)

    result = await db.execute(
        select(Asset)
        .where(and_(Asset.org_id == org_id, Asset.first_seen >= cutoff))
        .order_by(desc(Asset.first_seen))
        .limit(100)
    )
    assets = result.scalars().all()
    return [_parse_asset(a) for a in assets]


@router.get("/{asset_id}", summary="Get Asset Detail")
async def get_asset(
    asset_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get full detail for a specific asset including Shodan/SSL data."""
    result = await db.execute(
        select(Asset).where(
            and_(Asset.id == asset_id, Asset.org_id == current_user.org_id)
        )
    )
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    data = _parse_asset(asset)
    data["shodan_data"] = json.loads(asset.shodan_data or "{}")
    data["ssl_info"] = json.loads(asset.ssl_info or "{}")
    data["dns_records"] = json.loads(asset.dns_records or "{}")
    data["risk_summary"] = json.loads(asset.risk_summary or "{}")
    return data


@router.delete("/{asset_id}", summary="Delete Asset")
async def delete_asset(
    asset_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a discovered asset from inventory."""
    result = await db.execute(
        select(Asset).where(
            and_(Asset.id == asset_id, Asset.org_id == current_user.org_id)
        )
    )
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    await db.delete(asset)
    await db.commit()
    return {"status": "deleted", "id": asset_id}

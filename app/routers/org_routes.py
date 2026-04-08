from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rate_limit import limiter
from app.core.security import get_current_user, require_role
from app.models.organization import Organization
from app.models.scan import Scan
from app.models.user import User
from app.schemas.user import UserOut
from app.services.subscription import PLAN_LIMITS, get_plan

router = APIRouter(prefix="/org", tags=["Organization & SaaS"])


@router.get("/plan")
@limiter.limit("60/minute")
async def get_current_plan(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the current organization's subscription plan details."""
    result = await db.execute(
        select(Organization).where(Organization.id == current_user["org"])
    )
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # Count scans this month
    scan_count = await db.execute(
        select(func.count(Scan.id)).where(Scan.organization_id == org.id)
    )
    total_scans = scan_count.scalar() or 0

    # Count users
    user_count = await db.execute(
        select(func.count(User.id)).where(User.organization_id == org.id)
    )
    total_users = user_count.scalar() or 0

    plan = get_plan(org.plan)

    return {
        "organization": org.name,
        "plan": org.plan,
        "plan_details": plan,
        "usage": {
            "scans_used": total_scans,
            "users_count": total_users,
        },
    }


@router.get("/plans")
@limiter.limit("120/minute")
async def list_plans(request: Request):
    """List all available subscription plans."""
    return PLAN_LIMITS


@router.get("/users", response_model=list[UserOut])
@limiter.limit("60/minute")
async def list_org_users(
    request: Request,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """List all users in the organization (admin only)."""
    result = await db.execute(
        select(User).where(User.organization_id == current_user["org"])
    )
    users = result.scalars().all()
    return users


@router.patch("/users/{user_id}/role")
@limiter.limit("30/minute")
async def update_user_role(
    request: Request,
    user_id: str,
    role: str,
    current_user: dict = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    """Update a user's role (admin only)."""
    if role not in ("admin", "member"):
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'member'")

    result = await db.execute(
        select(User).where(
            User.id == user_id,
            User.organization_id == current_user["org"],
        )
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = role
    await db.commit()

    return {"message": f"User role updated to '{role}'", "user_id": user_id}


@router.get("/stats")
@limiter.limit("60/minute")
async def get_org_stats(
    request: Request,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get organization statistics."""
    org_id = current_user["org"]

    scan_count = await db.execute(
        select(func.count(Scan.id)).where(Scan.organization_id == org_id)
    )
    user_count = await db.execute(
        select(func.count(User.id)).where(User.organization_id == org_id)
    )

    # Risk distribution
    scans_result = await db.execute(
        select(Scan.risk_level, func.count(Scan.id))
        .where(Scan.organization_id == org_id, Scan.status == "completed")
        .group_by(Scan.risk_level)
    )
    risk_dist = {row[0]: row[1] for row in scans_result.all()}

    return {
        "total_scans": scan_count.scalar() or 0,
        "total_users": user_count.scalar() or 0,
        "risk_distribution": risk_dist,
    }

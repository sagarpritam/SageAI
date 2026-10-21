"""Security Audit Logging Service.

Provides centralized, tamper-evident audit recording for security operations,
policy modifications, user privilege changes, and verification checks.
"""

import json
import logging
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog

logger = logging.getLogger("SageAI.audit")


async def log_audit_event(
    db: AsyncSession,
    organization_id: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    user_id: Optional[str] = None,
    details: Optional[dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> Optional[AuditLog]:
    """Record an immutable security audit event.

    Never raises exceptions to callers; logs any failures safely.
    """
    if not organization_id or not action or not resource_type:
        logger.warning(
            "Cannot create audit log without organization_id, action, and resource_type"
        )
        return None

    try:
        details_str = json.dumps(details or {})
        entry = AuditLog(
            organization_id=organization_id,
            user_id=user_id,
            action=action.upper(),
            resource_type=resource_type.lower(),
            resource_id=str(resource_id) if resource_id else None,
            details=details_str,
            ip_address=ip_address,
        )
        db.add(entry)
        await db.commit()
        await db.refresh(entry)
        return entry
    except Exception as e:
        logger.error(f"Failed to record audit log for action '{action}': {e}")
        return None

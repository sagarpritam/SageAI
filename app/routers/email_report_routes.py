import json
import logging
from typing import Any, Dict

import redis.asyncio as redis
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.core.security import get_current_user

router = APIRouter(prefix="/email-reports", tags=["Email"])
logger = logging.getLogger(__name__)


async def get_redis_client():
    client = None
    try:
        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        yield client
    except Exception as e:
        logger.error(f"Redis connection error: {e}")
        yield None
    finally:
        if client:
            try:
                await client.aclose()
            except Exception:
                pass


@router.get("/config")
async def get_email_config(
    current_user: dict = Depends(get_current_user),
    redis_client=Depends(get_redis_client),
):
    if not redis_client:
        return {"recipients": [], "frequency": "weekly", "enabled": False}

    user_id = current_user.get("sub")
    try:
        config_str = await redis_client.get(f"email_config:{user_id}")
        if config_str:
            return json.loads(config_str)
    except Exception as e:
        logger.error(f"Error fetching email config from Redis: {e}")

    return {"recipients": [], "frequency": "weekly", "enabled": False}


@router.post("/config")
async def save_email_config(
    data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    redis_client=Depends(get_redis_client),
):
    if not redis_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Settings service unavailable",
        )

    user_id = current_user.get("sub")
    try:
        await redis_client.set(f"email_config:{user_id}", json.dumps(data))
    except Exception as e:
        logger.error(f"Error saving email config to Redis: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save configuration",
        )

    return data

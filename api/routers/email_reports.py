import os
import json
import redis
import jwt
from typing import Dict, Any
from fastapi import APIRouter, Header, HTTPException

router = APIRouter(prefix="/email-reports", tags=["Email"])

def get_redis():
    try:
        return redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"), decode_responses=True)
    except:
        return None

def extract_user_id(auth_header: str) -> str:
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("No sub claim")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/config")
async def get_email_config(authorization: str = Header(None)):
    user_id = extract_user_id(authorization)
    r = get_redis()
    if not r:
        return {"recipients": [], "frequency": "weekly", "enabled": False}
        
    config_str = r.get(f"email_config:{user_id}")
    if config_str:
        return json.loads(config_str)
        
    return {"recipients": [], "frequency": "weekly", "enabled": False}

@router.post("/config")
async def save_email_config(data: Dict[str, Any], authorization: str = Header(None)):
    user_id = extract_user_id(authorization)
    r = get_redis()
    if r:
        r.set(f"email_config:{user_id}", json.dumps(data))
    return data

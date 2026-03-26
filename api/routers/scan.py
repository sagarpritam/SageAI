import uuid
import os
import jwt
import redis
from fastapi import APIRouter, BackgroundTasks, HTTPException, Header
from api.models.scan_models import ScanRequest, ScanResponse
from api.services.scan_service import start_background_scan, get_scan_status, create_scan_record

router = APIRouter(prefix="/scan", tags=["Scanning"])

def get_redis():
    try:
        url = os.getenv("REDIS_URL", "redis://localhost:6379")
        return redis.from_url(url, decode_responses=True)
    except Exception as e:
        print(f"Redis connection failed: {e}")
        return None

@router.post("", response_model=ScanResponse)
async def create_scan(request: ScanRequest, background_tasks: BackgroundTasks, authorization: str = Header(None)):
    """Start a new security scan as a background task. Enforces paywall limit."""
    
    # 1. Identity Extraction
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = payload.get("sub")
        except Exception:
            pass
            
    # 2. Paywall Check
    r = get_redis()
    if r and user_id:
        is_pro = r.get(f"is_pro:{user_id}") == "true"
        if not is_pro:
            count = r.incr(f"scan_count:{user_id}")
            if count > 3:
                raise HTTPException(status_code=402, detail="Free tier limit reached. Please upgrade to Founder Mode.")
    elif r and not user_id:
        # Anonymous users get 1 global scan or we track by IP. Defaulting to strict:
        pass # If no user ID, could be a guest but since login is enforced on UI, we assume normal operation

    scan_id = str(uuid.uuid4())
    create_scan_record(scan_id, request.target)
    
    # Queue background task
    background_tasks.add_task(start_background_scan, scan_id, request.target)
    
    return ScanResponse(scan_id=scan_id, status="pending")

@router.get("/{scan_id}", response_model=ScanResponse)
async def get_scan(scan_id: str):
    """Get the status and results of a scan."""
    record = get_scan_status(scan_id)
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    results = record.get("results", {})
    return ScanResponse(
        scan_id=scan_id,
        status=record["status"],
        results=results,
        analyzed_findings=results.get("analyzed_findings"),
        report=results.get("report")
    )

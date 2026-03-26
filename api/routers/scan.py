import uuid
from fastapi import APIRouter, BackgroundTasks, HTTPException
from api.models.scan_models import ScanRequest, ScanResponse
from api.services.scan_service import start_background_scan, get_scan_status, create_scan_record

router = APIRouter(prefix="/scan", tags=["Scanning"])

@router.post("", response_model=ScanResponse)
async def create_scan(request: ScanRequest, background_tasks: BackgroundTasks):
    """Start a new security scan as a background task."""
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

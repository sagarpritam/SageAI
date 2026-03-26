import logging
from app.pipeline import run_pipeline

logger = logging.getLogger(__name__)

# Temporary In-Memory Storage
scan_storage = {}

def start_background_scan(scan_id: str, target: str):
    """Background task that runs the scanning pipeline and updates memory storage."""
    logger.info(f"Background worker started for scan_id: {scan_id}, target: {target}")
    try:
        scan_storage[scan_id]["status"] = "running"
        results = run_pipeline(target)
        
        # Override pipeline generated scan_id to match our API tracking
        results["scan_id"] = scan_id
        
        scan_storage[scan_id]["status"] = "completed"
        scan_storage[scan_id]["results"] = results
        logger.info(f"Background worker completed for scan_id: {scan_id}")
    except Exception as e:
        logger.error(f"Background scan failed for {scan_id}: {e}")
        scan_storage[scan_id]["status"] = "failed"
        scan_storage[scan_id]["results"] = {"error": str(e)}

def get_scan_status(scan_id: str):
    """Retrieve scan status from in-memory storage."""
    return scan_storage.get(scan_id)

def create_scan_record(scan_id: str, target: str):
    """Initialize a new scan in memory."""
    scan_storage[scan_id] = {
        "status": "pending",
        "target": target,
        "results": {}
    }

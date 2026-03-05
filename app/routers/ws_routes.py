"""WebSocket endpoint for real-time scan progress.

Clients connect to /ws/scan/{scan_id} and receive JSON messages:
  {"phase": "ssl", "status": "running", "progress": 3, "total": 11}
  {"phase": "shodan", "status": "complete", "progress": 7, "total": 11, "findings_count": 2}
  {"phase": "done", "status": "complete", "progress": 11, "total": 11, "risk_score": 72}
"""

import json
import asyncio
import logging
from collections import defaultdict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("SageAI.ws")

router = APIRouter(tags=["WebSocket"])

# In-memory channel: scan_id → set of connected websockets
_channels: dict[str, set[WebSocket]] = defaultdict(set)


async def broadcast_scan_progress(scan_id: str, data: dict):
    """Send progress update to all clients watching a scan."""
    message = json.dumps(data)
    dead = set()
    for ws in _channels.get(scan_id, set()):
        try:
            await ws.send_text(message)
        except Exception:
            dead.add(ws)
    _channels[scan_id] -= dead


@router.websocket("/ws/scan/{scan_id}")
async def scan_progress_ws(websocket: WebSocket, scan_id: str):
    """WebSocket endpoint for real-time scan progress."""
    await websocket.accept()
    _channels[scan_id].add(websocket)
    logger.info(f"WS connected for scan {scan_id} ({len(_channels[scan_id])} clients)")

    try:
        # Keep connection alive, listen for client disconnect
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=300)
            except asyncio.TimeoutError:
                # Send ping to check if client is still alive
                await websocket.send_json({"type": "ping"})
    except WebSocketDisconnect:
        pass
    finally:
        _channels[scan_id].discard(websocket)
        if not _channels[scan_id]:
            del _channels[scan_id]
        logger.info(f"WS disconnected for scan {scan_id}")

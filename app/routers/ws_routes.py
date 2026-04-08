"""WebSocket endpoint for real-time scan progress.

Clients connect to /ws/scan/{scan_id} and receive JSON messages:
  {"phase": "ssl", "status": "running", "progress": 3, "total": 11}
  {"phase": "shodan", "status": "complete", "progress": 7, "total": 11, "findings_count": 2}
  {"phase": "done", "status": "complete", "progress": 11, "total": 11, "risk_score": 72}
"""

import asyncio
import json
import logging
from collections import defaultdict
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.warroom_service import warroom_manager

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
async def scan_progress_ws(websocket: WebSocket, scan_id: UUID):
    """WebSocket endpoint for real-time scan progress."""
    await websocket.accept()
    scan_id_str = str(scan_id)
    _channels[scan_id_str].add(websocket)
    logger.info(
        f"WS connected for scan {scan_id_str} ({len(_channels[scan_id_str])} clients)"
    )

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
        _channels[scan_id_str].discard(websocket)
        if not _channels[scan_id_str]:
            del _channels[scan_id_str]
        logger.info(f"WS disconnected for scan {scan_id_str}")

@router.websocket("/ws/warroom")
async def warroom_ws(websocket: WebSocket):
    """Global WebSocket endpoint for real-time attack visualization."""
    await warroom_manager.connect(websocket)

    try:
        while True:
            # We don't expect messages from client, but keep alive
            await asyncio.wait_for(websocket.receive_text(), timeout=300)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WarRoom WS error: {e}")
    finally:
        warroom_manager.disconnect(websocket)

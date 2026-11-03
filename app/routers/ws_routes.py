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
from typing import Any, Dict, Optional
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.services.warroom_service import warroom_manager

logger = logging.getLogger("SageAI.ws")

router = APIRouter(tags=["WebSocket & WarRoom"])

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
                # Expect ping every 30s from client, or timeout in 60s
                await asyncio.wait_for(websocket.receive_text(), timeout=60)
            except asyncio.TimeoutError:
                # Send keepalive ping
                await websocket.send_json({"type": "ping"})
    except WebSocketDisconnect:
        pass
    finally:
        _channels[scan_id_str].discard(websocket)
        if not _channels[scan_id_str]:
            del _channels[scan_id_str]
        logger.info(f"WS disconnected for scan {scan_id_str}")


# ── Global WarRoom WebSocket & HTTP REST Endpoints ──────────


class WarRoomEventIn(BaseModel):
    type: str = "finding.discovered"
    source: str = "DefenseGrid"
    target: str = "api.internal.corp"
    priority: int = 3
    payload: Dict[str, Any] = {}


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


@router.get("/warroom/events")
async def get_warroom_events(limit: int = 50):
    """HTTP REST endpoint returning current War Room attack and telemetry events."""
    return {"status": "success", "events": warroom_manager.get_history(limit=limit)}


@router.post("/warroom/events")
async def post_warroom_event(event_in: WarRoomEventIn):
    """Dispatch a telemetry event to the War Room."""
    evt = await warroom_manager.emit_event(
        event_type=event_in.type,
        source=event_in.source,
        target=event_in.target,
        payload=event_in.payload,
        priority=event_in.priority,
    )
    return {"status": "success", "event": evt}


# ── Deep Search WebSocket ─────────────────────────


_deep_search_channels: dict[str, set[WebSocket]] = defaultdict(set)


async def broadcast_deep_search_progress(session_id: str, data: dict):
    """Send deep search progress to all clients watching a session."""
    message = json.dumps(data)
    dead = set()
    for ws in _deep_search_channels.get(session_id, set()):
        try:
            await ws.send_text(message)
        except Exception:
            dead.add(ws)
    _deep_search_channels[session_id] -= dead


@router.websocket("/ws/deep-search/{session_id}")
async def deep_search_ws(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for real-time deep search progress."""
    await websocket.accept()
    _deep_search_channels[session_id].add(websocket)
    logger.info(
        f"WS connected for deep search {session_id} "
        f"({len(_deep_search_channels[session_id])} clients)"
    )

    try:
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=600)
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "ping"})
    except WebSocketDisconnect:
        pass
    finally:
        _deep_search_channels[session_id].discard(websocket)
        if not _deep_search_channels[session_id]:
            del _deep_search_channels[session_id]
        logger.info(f"WS disconnected for deep search {session_id}")

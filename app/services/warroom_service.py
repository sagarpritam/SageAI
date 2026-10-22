import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Set

from fastapi import WebSocket

from app.core.config import settings

# Attempt to import SageStrike Event Bus
try:
    from sagestrike.event_bus import (
        Event as _SsEvent,
        EventBus as _SsEventBus,
        EventPriority as _SsEventPriority,
        EventType as _SsEventType,
    )
    _SAGESTRIKE_AVAILABLE = True
except ImportError:
    _SsEvent = None  # type: ignore[assignment]
    _SsEventBus = None  # type: ignore[assignment]
    _SsEventPriority = None  # type: ignore[assignment]
    _SsEventType = None  # type: ignore[assignment]
    _SAGESTRIKE_AVAILABLE = False

# Fallback/Mock types for environments where sagestrike isn't installed
from dataclasses import dataclass
from enum import Enum


class EventType(Enum):
    SCAN_STARTED = "scan.started"
    SCAN_COMPLETED = "scan.completed"
    EXPLOIT_SUCCESS = "exploit.success"
    FINDING_DISCOVERED = "finding.discovered"
    TELEMETRY = "telemetry"


class EventPriority(Enum):
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4


@dataclass
class Event:
    id: str
    type: EventType
    source: str
    timestamp: datetime
    priority: EventPriority
    payload: Dict
    target: Optional[str] = None

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type.value,
            "source": self.source,
            "timestamp": self.timestamp.isoformat(),
            "priority": self.priority.value,
            "payload": self.payload,
            "target": self.target,
        }


if _SAGESTRIKE_AVAILABLE:
    # Use the real types at runtime
    Event = _SsEvent  # type: ignore[assignment,misc]
    EventPriority = _SsEventPriority  # type: ignore[assignment,misc]
    EventType = _SsEventType  # type: ignore[assignment,misc]


logger = logging.getLogger("SageAI.warroom")


class WarRoomManager:
    """Manages real-time attack visualization state and WebSocket distribution."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(WarRoomManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.active_connections: Set[WebSocket] = set()
        self.event_history: List[Dict] = []
        self.max_history = 100
        self.bus: Optional[Any] = None
        self._initialized = True

    async def start(self):
        """Initialize the event bus and start listening for events."""
        try:
            if not _SAGESTRIKE_AVAILABLE:
                raise ImportError("sagestrike not available")
            assert _SsEventBus is not None
            self.bus = _SsEventBus(
                kafka_brokers=settings.KAFKA_BROKERS.split(","),
                redis_url=settings.REDIS_URL,
                service_name="warroom-manager",
            )
            # Subscribe to all events — subscribe() may be sync or async
            _sub = self.bus.subscribe("*", self.handle_bus_event)
            if _sub is not None:
                await _sub
            logger.info("📡 WarRoomManager connected to SageStrike EventBus")
        except Exception as e:
            logger.error(f"❌ Failed to connect WarRoomManager to EventBus: {e}")

    async def handle_bus_event(self, event: Event):
        """Callback for EventBus events."""
        event_dict = event.to_dict()

        # Enhance message if missing
        if not event_dict["payload"].get("message"):
            msg = self._generate_message(event)
            event_dict["payload"]["message"] = msg

        # Add geo-simulation if missing (for the globe)
        if not event_dict["payload"].get("geo"):
            event_dict["payload"]["geo"] = self._simulate_geo(
                event_dict.get("target", "")
            )

        # Update history
        self.event_history.append(event_dict)
        if len(self.event_history) > self.max_history:
            self.event_history.pop(0)

        # Broadcast to all connected clients
        await self.broadcast(event_dict)

    def _generate_message(self, event: Event) -> str:
        """Generate a human-readable message for the event."""
        etype = event.type.value if hasattr(event.type, "value") else str(event.type)
        target = event.target or "unknown target"

        if etype == "exploit.success":
            return f"CRITICAL: Exploit successful on {target}!"
        elif etype == "exploit.attempt":
            return f"Note: Exploit attempt detected against {target}"
        elif etype == "finding.discovered":
            severity = event.payload.get("severity", "unknown")
            return f"New {severity} vulnerability found on {target}"
        elif etype == "scan.started":
            return f"Infrastructure scan initiated for {target}"
        elif etype == "scan.completed":
            return f"Scan segment for {target} finished"

        return f"System Event: {etype} from {event.source}"

    def _simulate_geo(self, target: str) -> Dict:
        """Simulate geo-coordinates for visual flair if real data isn't available."""
        import random

        # In a real app, this would use a Geo-IP database
        return {
            "lat": random.uniform(-60, 80),
            "lng": random.uniform(-180, 180),
            "city": "Unknown",
            "country": "CyberSpace",
        }

    async def connect(self, websocket: WebSocket):
        """Register a new WebSocket connection and send initial state."""
        await websocket.accept()
        self.active_connections.add(websocket)

        # Send history for "rehydration"
        if self.event_history:
            await websocket.send_json(
                {"type": "rehydration", "data": self.event_history}
            )

        logger.info(
            f"🔌 WarRoom client connected. Total: {len(self.active_connections)}"
        )

    def disconnect(self, websocket: WebSocket):
        """Unregister a WebSocket connection."""
        self.active_connections.discard(websocket)
        logger.info(
            f"🔌 WarRoom client disconnected. Total: {len(self.active_connections)}"
        )

    async def broadcast(self, data: Dict):
        """Send data to all active WebSocket clients."""
        if not self.active_connections:
            return

        message = json.dumps(data)
        dead = set()

        for ws in self.active_connections:
            try:
                await ws.send_text(message)
            except Exception:
                dead.add(ws)

        for ws in dead:
            self.disconnect(ws)


warroom_manager = WarRoomManager()

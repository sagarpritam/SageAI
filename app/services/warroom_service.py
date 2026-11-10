import json
import logging
import random
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional, Set

from fastapi import WebSocket

from app.core.config import settings

_SsEventBus: Any
EventType: Any
EventPriority: Any
Event: Any


class _FallbackEventType(Enum):
    SCAN_STARTED = "scan.started"
    SCAN_COMPLETED = "scan.completed"
    EXPLOIT_SUCCESS = "exploit.success"
    EXPLOIT_ATTEMPT = "exploit.attempt"
    FINDING_DISCOVERED = "finding.discovered"
    TELEMETRY = "telemetry"


class _FallbackEventPriority(Enum):
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4


@dataclass
class _FallbackEvent:
    id: str
    type: _FallbackEventType
    source: str
    timestamp: datetime
    priority: _FallbackEventPriority
    payload: Dict
    target: Optional[str] = None

    def to_dict(self):
        etype = self.type.value if hasattr(self.type, "value") else str(self.type)
        eprio = (
            self.priority.value
            if hasattr(self.priority, "value")
            else int(self.priority)
        )
        return {
            "id": self.id,
            "type": etype,
            "source": self.source,
            "timestamp": self.timestamp.isoformat(),
            "priority": eprio,
            "payload": self.payload,
            "target": self.target,
        }


# Attempt to import SageStrike Event Bus
try:
    from sagestrike.event_bus import (
        Event as _SsEvent,
    )
    from sagestrike.event_bus import (
        EventBus as _LoadedEventBus,
    )
    from sagestrike.event_bus import (
        EventPriority as _SsEventPriority,
    )
    from sagestrike.event_bus import (
        EventType as _SsEventType,
    )

    Event = _SsEvent
    EventPriority = _SsEventPriority
    EventType = _SsEventType
    _SsEventBus = _LoadedEventBus
    _SAGESTRIKE_AVAILABLE = True
except ImportError:
    Event = _FallbackEvent
    EventPriority = _FallbackEventPriority
    EventType = _FallbackEventType
    _SsEventBus = None
    _SAGESTRIKE_AVAILABLE = False


logger = logging.getLogger("SageAI.warroom")

# Real-world locations for visual telemetry flair
SEED_LOCATIONS = [
    {
        "lat": 38.8951,
        "lng": -77.0364,
        "city": "Washington, D.C.",
        "country": "United States",
    },
    {"lat": 51.5074, "lng": -0.1278, "city": "London", "country": "United Kingdom"},
    {"lat": 50.1109, "lng": 8.6821, "city": "Frankfurt", "country": "Germany"},
    {"lat": 35.6762, "lng": 139.6503, "city": "Tokyo", "country": "Japan"},
    {"lat": 1.3521, "lng": 103.8198, "city": "Singapore", "country": "Singapore"},
    {
        "lat": 25.2048,
        "lng": 55.2708,
        "city": "Dubai",
        "country": "United Arab Emirates",
    },
    {"lat": -33.8688, "lng": 151.2093, "city": "Sydney", "country": "Australia"},
]


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
        self._seed_telemetry()
        self._initialized = True

    def _seed_telemetry(self):
        """Populate initial realistic threat telemetry for immediate War Room visualization."""
        now = datetime.now(timezone.utc)
        seeds = [
            {
                "id": f"evt-seed-{uuid.uuid4().hex[:8]}",
                "type": "exploit.attempt",
                "source": "DeepAnalysisAgent",
                "target": "https://auth.enterprise-mesh.internal",
                "priority": 4,
                "payload": {
                    "message": "Cloud IMDSv2 SSRF exploit attempt intercepted and blocked at edge.",
                    "description": "Probe to 169.254.169.254 neutralized by SageAI Perimeter Defense.",
                    "geo": SEED_LOCATIONS[0],
                },
                "timestamp": now.isoformat(),
            },
            {
                "id": f"evt-seed-{uuid.uuid4().hex[:8]}",
                "type": "finding.discovered",
                "source": "DeceptionMesh",
                "target": "fake-aws-canary-prod",
                "priority": 4,
                "payload": {
                    "message": "AWS Honeytoken Credential Accessed from unauthorized foreign ASN.",
                    "description": "Honeytoken AKIA-CANARY-TRIPWIRE queried via STS GetCallerIdentity.",
                    "geo": SEED_LOCATIONS[2],
                },
                "timestamp": now.isoformat(),
            },
            {
                "id": f"evt-seed-{uuid.uuid4().hex[:8]}",
                "type": "exploit.success",
                "source": "CyberRangeSimulator",
                "target": "simulated-k8s-ingress.range.local",
                "priority": 3,
                "payload": {
                    "message": "Simulated APT29 Red-Team Drill: JWT Algorithm Confusion proof confirmed in Sandbox.",
                    "description": "Sandboxed verification confirmed CVE-2022-21449 signature bypass.",
                    "geo": SEED_LOCATIONS[1],
                },
                "timestamp": now.isoformat(),
            },
            {
                "id": f"evt-seed-{uuid.uuid4().hex[:8]}",
                "type": "scan.completed",
                "source": "ThreatRuleSynthesizer",
                "target": "edge-gateway-eu",
                "priority": 2,
                "payload": {
                    "message": "Automated Virtual WAF & Sigma Rule auto-deployed to cloud edge.",
                    "description": "Rule SYNTH-MODSEC-9002 active with zero-false-positive guarantee.",
                    "geo": SEED_LOCATIONS[3],
                },
                "timestamp": now.isoformat(),
            },
        ]
        self.event_history.extend(seeds)

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
            _sub = self.bus.subscribe("*", self.handle_bus_event)
            if _sub is not None:
                await _sub
            logger.info("📡 WarRoomManager connected to SageStrike EventBus")
        except Exception as e:
            logger.info(f"WarRoomManager running in autonomous standalone mode: {e}")

    async def emit_event(
        self,
        event_type: str,
        source: str,
        target: str,
        payload: Dict[str, Any],
        priority: int = 2,
    ) -> Dict[str, Any]:
        """Directly emit an attack or security telemetry event to all WarRoom listeners."""
        evt_id = f"evt-{uuid.uuid4().hex[:10]}"
        now = datetime.now(timezone.utc).isoformat()

        # Enhance geo if missing
        if not payload.get("geo"):
            payload["geo"] = self._simulate_geo(target)

        event_dict = {
            "id": evt_id,
            "type": event_type,
            "source": source,
            "target": target,
            "priority": priority,
            "payload": payload,
            "timestamp": now,
        }

        self.event_history.append(event_dict)
        if len(self.event_history) > self.max_history:
            self.event_history.pop(0)

        await self.broadcast(event_dict)
        return event_dict

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Return the recent event history."""
        return list(reversed(self.event_history[-limit:]))

    async def handle_bus_event(self, event: Any):
        """Callback for EventBus events."""
        event_dict = event.to_dict()

        if not event_dict["payload"].get("message"):
            msg = self._generate_message(event)
            event_dict["payload"]["message"] = msg

        if not event_dict["payload"].get("geo"):
            event_dict["payload"]["geo"] = self._simulate_geo(
                event_dict.get("target", "")
            )

        self.event_history.append(event_dict)
        if len(self.event_history) > self.max_history:
            self.event_history.pop(0)

        await self.broadcast(event_dict)

    def _generate_message(self, event: Any) -> str:
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
        """Simulate geo-coordinates using curated high-fidelity locations."""
        return random.choice(SEED_LOCATIONS)

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

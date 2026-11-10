"""
SageStrike Event Bus - Distributed event processing with Kafka and Redis
"""

import asyncio
import inspect
import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Dict, List, Optional

import redis.asyncio as redis
from kafka import KafkaConsumer, KafkaProducer
from kafka.admin import KafkaAdminClient, NewTopic

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sagestrike.events")


class EventType(Enum):
    SCAN_STARTED = "scan.started"
    SCAN_COMPLETED = "scan.completed"
    SCAN_FAILED = "scan.failed"
    EXPLOIT_ATTEMPT = "exploit.attempt"
    EXPLOIT_SUCCESS = "exploit.success"
    EXPLOIT_FAILED = "exploit.failed"
    FINDING_DISCOVERED = "finding.discovered"
    ASSET_DISCOVERED = "asset.discovered"
    TELEMETRY = "telemetry"
    ALERT = "alert"


class EventPriority(Enum):
    LOW = 1
    NORMAL = 2
    HIGH = 3
    CRITICAL = 4


@dataclass
class Event:
    """Base event structure"""

    id: str
    type: EventType
    source: str  # service/component that generated the event
    timestamp: datetime
    priority: EventPriority
    payload: Dict[str, Any]
    correlation_id: Optional[str] = None
    target: Optional[str] = None  # target host/asset

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "type": self.type.value,
            "source": self.source,
            "timestamp": self.timestamp.isoformat(),
            "priority": self.priority.value,
            "payload": self.payload,
            "correlation_id": self.correlation_id,
            "target": self.target,
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "Event":
        return cls(
            id=data["id"],
            type=EventType(data["type"]),
            source=data["source"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
            priority=EventPriority(data["priority"]),
            payload=data["payload"],
            correlation_id=data.get("correlation_id"),
            target=data.get("target"),
        )


class EventHandler(ABC):
    """Base class for event handlers"""

    @abstractmethod
    async def handle(self, event: Event) -> None:
        """Handle an event"""
        pass

    def can_handle(self, event: Event) -> bool:
        """Check if this handler can process the event"""
        return True


class EventBus:
    """Main event bus with Kafka and Redis Streams"""

    def __init__(
        self,
        kafka_brokers: List[str],
        redis_url: str,
        service_name: str,
    ):
        self.service_name = service_name
        self.kafka_brokers = kafka_brokers
        self.redis_url = redis_url

        # Kafka setup
        self.kafka_producer: Optional[KafkaProducer] = None
        self.kafka_consumer: Optional[KafkaConsumer] = None
        self.kafka_admin: Optional[KafkaAdminClient] = None

        # Redis setup
        self.redis_client: Optional[redis.Redis] = None

        # Handlers
        self.handlers: Dict[EventType, List[EventHandler]] = {
            event_type: [] for event_type in EventType
        }
        self.generic_handlers: List[EventHandler] = []

        # Running state
        self._running = False
        self._tasks: List[asyncio.Task] = []

    async def connect(self):
        """Connect to Kafka and Redis"""
        # Connect to Kafka
        self.kafka_producer = KafkaProducer(
            bootstrap_servers=self.kafka_brokers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda v: v.encode("utf-8") if v else None,
            acks="all",
            retries=3,
            compression_type="gzip",
        )

        self.kafka_admin = KafkaAdminClient(bootstrap_servers=self.kafka_brokers)
        await self._ensure_topics()

        # Connect to Redis
        self.redis_client = redis.from_url(self.redis_url, decode_responses=True)
        ping_res = self.redis_client.ping()
        if inspect.isawaitable(ping_res):
            await ping_res

        logger.info(f"Event bus connected for service {self.service_name}")

    async def _ensure_topics(self):
        """Ensure Kafka topics exist"""
        if not self.kafka_admin:
            raise RuntimeError("Kafka admin client not connected")

        existing_topics = self.kafka_admin.list_topics()

        topics_to_create = []
        for event_type in EventType:
            topic = f"sagestrike.{event_type.value}"
            if topic not in existing_topics:
                topics_to_create.append(
                    NewTopic(
                        name=topic,
                        num_partitions=3,
                        replication_factor=1,
                    )
                )

        # Priority queue topics
        for priority in EventPriority:
            topic = f"sagestrike.priority.{priority.value}"
            if topic not in existing_topics:
                topics_to_create.append(
                    NewTopic(
                        name=topic,
                        num_partitions=3,
                        replication_factor=1,
                    )
                )

        if topics_to_create:
            try:
                self.kafka_admin.create_topics(topics_to_create)
                logger.info(f"Created {len(topics_to_create)} Kafka topics")
            except Exception as e:
                logger.error(f"Failed to create topics: {e}")

    async def publish(
        self, event: Event, priority: EventPriority = EventPriority.NORMAL
    ):
        """Publish an event to Kafka"""
        if not self.kafka_producer:
            raise RuntimeError("Event bus not connected")

        # Send to event-specific topic
        topic = f"sagestrike.{event.type.value}"

        try:
            self.kafka_producer.send(
                topic,
                key=event.correlation_id or event.id,
                value=event.to_dict(),
            )
            # Non-blocking send
            self.kafka_producer.flush()

            # Also add to priority queue for real-time processing
            await self._add_to_priority_queue(event, priority)

            # Store in Redis Streams for time-series queries
            await self._add_to_redis_stream(event)

        except Exception as e:
            logger.error(f"Failed to publish event: {e}")
            raise

    async def _add_to_priority_queue(self, event: Event, priority: EventPriority):
        """Add event to Redis priority queue"""
        if not self.redis_client:
            return

        queue_key = f"sagestrike:queue:{priority.value}"
        await self.redis_client.zadd(
            queue_key,
            {json.dumps(event.to_dict()): event.timestamp.timestamp()},
        )

    async def _add_to_redis_stream(self, event: Event):
        """Add event to Redis Streams for time-series"""
        if not self.redis_client:
            return

        stream_key = f"sagestrike:events:{event.type.value}"
        await self.redis_client.xadd(
            stream_key,
            event.to_dict(),
            maxlen=10000,  # Keep last 10k events per type
        )

    def subscribe(self, event_type: EventType, handler: EventHandler):
        """Subscribe a handler to an event type"""
        self.handlers[event_type].append(handler)
        logger.info(f"Subscribed {handler.__class__.__name__} to {event_type.value}")

    def subscribe_all(self, handler: EventHandler):
        """Subscribe a handler to all events"""
        self.generic_handlers.append(handler)
        logger.info(f"Subscribed {handler.__class__.__name__} to all events")

    async def start_consuming(self):
        """Start consuming events from Kafka"""
        self._running = True

        # Create consumer
        self.kafka_consumer = KafkaConsumer(
            bootstrap_servers=self.kafka_brokers,
            value_deserializer=lambda v: json.loads(v.decode("utf-8")),
            group_id=f"{self.service_name}-consumers",
            auto_offset_reset="latest",
            enable_auto_commit=True,
        )

        # Subscribe to all event topics
        topics = [f"sagestrike.{et.value}" for et in EventType]
        self.kafka_consumer.subscribe(topics)

        logger.info(f"Started consuming from {len(topics)} topics")

        # Start processing
        while self._running:
            try:
                # Poll for messages
                message_batch = self.kafka_consumer.poll(timeout_ms=1000)

                for _topic_partition, messages in message_batch.items():
                    for message in messages:
                        await self._process_message(message.value)

            except Exception as e:
                logger.error(f"Error consuming messages: {e}")
                await asyncio.sleep(1)

    async def _process_message(self, data: Dict):
        """Process a consumed message"""
        try:
            event = Event.from_dict(data)

            # Run generic handlers
            for handler in self.generic_handlers:
                if handler.can_handle(event):
                    asyncio.create_task(handler.handle(event))

            # Run specific handlers
            for handler in self.handlers.get(event.type, []):
                asyncio.create_task(handler.handle(event))

        except Exception as e:
            logger.error(f"Failed to process message: {e}")

    async def get_recent_events(
        self,
        event_type: EventType,
        count: int = 100,
    ) -> List[Event]:
        """Get recent events from Redis Streams"""
        if not self.redis_client:
            return []

        stream_key = f"sagestrike:events:{event_type.value}"
        events_data = await self.redis_client.xrevrange(
            stream_key,
            count=count,
        )

        events = []
        for _event_id, event_data in events_data or []:
            if not event_data:
                continue
            try:
                # Parse event from stream
                event_dict = dict(event_data)
                event = Event.from_dict(event_dict)
                events.append(event)
            except Exception as e:
                logger.error(f"Failed to parse event: {e}")

        return events

    async def get_scan_correlation(self, correlation_id: str) -> List[Event]:
        """Get all events related to a specific scan"""
        if not self.redis_client:
            return []

        # Search across all event types
        events = []

        for event_type in EventType:
            stream_key = f"sagestrike:events:{event_type.value}"
            # This is inefficient but works for demo
            # Production would use secondary index
            all_events = await self.redis_client.xrange(stream_key)

            for _event_id, event_data in all_events or []:
                if not event_data:
                    continue
                if event_data.get("correlation_id") == correlation_id:
                    events.append(Event.from_dict(dict(event_data)))

        return sorted(events, key=lambda e: e.timestamp)

    async def close(self):
        """Close connections"""
        self._running = False

        if self.kafka_producer:
            self.kafka_producer.close()

        if self.kafka_consumer:
            self.kafka_consumer.close()

        if self.redis_client:
            await self.redis_client.close()

        # Cancel all tasks
        for task in self._tasks:
            task.cancel()

        logger.info("Event bus closed")


# ==================== EXAMPLE HANDLERS ====================


class FindingsAggregatorHandler(EventHandler):
    """Aggregates findings into a database"""

    async def handle(self, event: Event) -> None:
        if event.type not in [EventType.FINDING_DISCOVERED, EventType.EXPLOIT_SUCCESS]:
            return

        logger.info(
            f"Aggregating finding: {event.payload.get('vulnerability', 'unknown')}"
        )

        # Would insert into PostgreSQL here
        # await db.execute("""
        #     INSERT INTO findings (id, target, vulnerability, severity, evidence)
        #     VALUES ($1, $2, $3, $4, $5)
        # """, ...)


class AlertHandler(EventHandler):
    """Sends alerts for critical findings"""

    async def handle(self, event: Event) -> None:
        if event.priority != EventPriority.CRITICAL:
            return

        logger.critical(f"CRITICAL ALERT: {event.type.value} on {event.target}")

        # Would send Slack/PagerDuty notification
        # await send_slack_alert(event)


class TelemetryCollectorHandler(EventHandler):
    """Collects system telemetry"""

    async def handle(self, event: Event) -> None:
        if event.type != EventType.TELEMETRY:
            return

        # Store in Prometheus/InfluxDB
        logger.debug(f"Collected telemetry from {event.source}")


class RealTimeWebSocketHandler(EventHandler):
    """Broadcasts events to WebSocket clients"""

    def __init__(self):
        self.websocket_clients: List[Callable] = []

    def add_client(self, callback: Callable):
        self.websocket_clients.append(callback)

    async def handle(self, event: Event) -> None:
        # Broadcast to all connected WebSocket clients
        for callback in self.websocket_clients:
            try:
                await callback(event.to_dict())
            except Exception as e:
                logger.error(f"Failed to send to WebSocket client: {e}")


# ==================== COORDINATOR ====================


class ScanCoordinator:
    """Coordinates distributed scans using event bus"""

    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus
        self.active_scans: Dict[str, Dict] = {}

    async def start_scan(self, target: str, scan_type: str, options: Dict) -> str:
        """Start a new scan and return correlation ID"""
        import uuid

        correlation_id = str(uuid.uuid4())

        event = Event(
            id=str(uuid.uuid4()),
            type=EventType.SCAN_STARTED,
            source="coordinator",
            timestamp=datetime.utcnow(),
            priority=EventPriority.NORMAL,
            payload={
                "scan_type": scan_type,
                "options": options,
            },
            correlation_id=correlation_id,
            target=target,
        )

        await self.event_bus.publish(event)

        self.active_scans[correlation_id] = {
            "target": target,
            "status": "running",
            "started_at": datetime.utcnow(),
        }

        return correlation_id

    async def handle_scan_result(self, event: Event):
        """Handle scan results"""
        if event.type == EventType.SCAN_COMPLETED:
            correlation_id = event.correlation_id
            if correlation_id in self.active_scans:
                self.active_scans[correlation_id]["status"] = "completed"
                self.active_scans[correlation_id]["completed_at"] = datetime.utcnow()

                logger.info(f"Scan {correlation_id} completed")


# ==================== MAIN ====================


async def main():
    """Example usage"""
    event_bus = EventBus(
        kafka_brokers=["localhost:9092"],
        redis_url="redis://localhost:6379",
        service_name="sagestrike-coordinator",
    )

    await event_bus.connect()

    # Register handlers
    event_bus.subscribe(EventType.FINDING_DISCOVERED, FindingsAggregatorHandler())
    event_bus.subscribe_all(AlertHandler())

    # Start consuming in background
    asyncio.create_task(event_bus.start_consuming())

    # Example: Start a scan
    coordinator = ScanCoordinator(event_bus)
    scan_id = await coordinator.start_scan(
        target="example.com",
        scan_type="full",
        options={"ports": "1-65535", "intensity": "aggressive"},
    )

    print(f"Started scan: {scan_id}")

    # Publish some test events
    import uuid

    for i in range(5):
        event = Event(
            id=str(uuid.uuid4()),
            type=EventType.FINDING_DISCOVERED,
            source="scanner-1",
            timestamp=datetime.utcnow(),
            priority=EventPriority.HIGH if i % 2 == 0 else EventPriority.NORMAL,
            payload={
                "port": 80 + i,
                "service": "http",
                "vulnerability": f"test-vuln-{i}",
            },
            correlation_id=scan_id,
            target="example.com",
        )
        await event_bus.publish(event)
        await asyncio.sleep(0.5)

    # Keep running
    await asyncio.sleep(10)
    await event_bus.close()


if __name__ == "__main__":
    asyncio.run(main())

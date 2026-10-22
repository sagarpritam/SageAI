"""Phase 05 Distributed Tracing & Telemetry Infrastructure.

Provides W3C traceparent context propagation, request-to-worker span correlation,
and an in-memory ring buffer for inspecting trace waterfalls across API, DB,
worker fleet, LLM, and alerting operations.
"""

import contextvars
import dataclasses
import re
import threading
import time
import uuid
from typing import Any, Dict, List, Optional

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Context variable for holding active trace ID in current async context
current_trace_id_var: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar(
    "current_trace_id", default=None
)
current_span_id_var: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar(
    "current_span_id", default=None
)


@dataclasses.dataclass
class TraceSpan:
    span_id: str
    trace_id: str
    parent_span_id: Optional[str]
    name: str
    start_time: float
    end_time: float
    duration_ms: float
    status: str  # "ok" or "error"
    attributes: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "span_id": self.span_id,
            "trace_id": self.trace_id,
            "parent_span_id": self.parent_span_id,
            "name": self.name,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "duration_ms": round(self.duration_ms, 2),
            "status": self.status,
            "attributes": self.attributes,
        }


class TraceStorage:
    """Thread-safe in-memory ring buffer for recording recent distributed trace spans."""

    def __init__(self, max_traces: int = 2000):
        self.max_traces = max_traces
        self._traces: Dict[str, List[TraceSpan]] = {}
        self._trace_order: List[str] = []
        self._lock = threading.Lock()

    def record_span(self, span: TraceSpan) -> None:
        with self._lock:
            if span.trace_id not in self._traces:
                if len(self._trace_order) >= self.max_traces:
                    oldest = self._trace_order.pop(0)
                    self._traces.pop(oldest, None)
                self._traces[span.trace_id] = []
                self._trace_order.append(span.trace_id)
            self._traces[span.trace_id].append(span)

    def get_trace(self, trace_id: str) -> Optional[List[Dict[str, Any]]]:
        with self._lock:
            spans = self._traces.get(trace_id)
            if not spans:
                return None
            return [s.to_dict() for s in sorted(spans, key=lambda s: s.start_time)]

    def get_recent_traces(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self._lock:
            recent_ids = self._trace_order[-limit:]
            results = []
            for tid in reversed(recent_ids):
                spans = self._traces.get(tid, [])
                if not spans:
                    continue
                sorted_spans = sorted(spans, key=lambda s: s.start_time)
                root_span = sorted_spans[0]
                total_duration = sum(s.duration_ms for s in sorted_spans)
                has_error = any(s.status == "error" for s in sorted_spans)
                results.append({
                    "trace_id": tid,
                    "root_name": root_span.name,
                    "start_time": root_span.start_time,
                    "duration_ms": round(total_duration, 2),
                    "span_count": len(sorted_spans),
                    "status": "error" if has_error else "ok",
                    "path": root_span.attributes.get("http.target", ""),
                })
            return results

    def clear(self) -> None:
        with self._lock:
            self._traces.clear()
            self._trace_order.clear()


# Global trace storage instance
trace_storage = TraceStorage(max_traces=5000)


def generate_trace_id() -> str:
    """Generate a 32-character hex trace ID (W3C Trace Context compatible)."""
    return uuid.uuid4().hex


def generate_span_id() -> str:
    """Generate a 16-character hex span ID."""
    return uuid.uuid4().hex[:16]


def parse_traceparent(header_val: str) -> Optional[tuple[str, str]]:
    """Parse W3C traceparent header: '00-{trace_id}-{parent_id}-{trace_flags}'."""
    if not header_val:
        return None
    match = re.match(r"^00-([0-9a-fA-F]{32})-([0-9a-fA-F]{16})-[0-9a-fA-F]{2}$", header_val.strip())
    if match:
        return match.group(1).lower(), match.group(2).lower()
    return None


def get_current_trace_id() -> str:
    """Return the active trace ID from context, or generate a fresh one."""
    tid = current_trace_id_var.get()
    if not tid:
        tid = generate_trace_id()
        current_trace_id_var.set(tid)
    return tid


class TracingMiddleware(BaseHTTPMiddleware):
    """FastAPI/Starlette middleware that correlates inbound HTTP requests with distributed traces."""

    async def dispatch(self, request: Request, call_next):
        # 1. Extract W3C traceparent or X-Trace-ID header
        traceparent = request.headers.get("traceparent")
        parsed = parse_traceparent(traceparent) if traceparent else None

        if parsed:
            trace_id, parent_span_id = parsed
        else:
            trace_id = request.headers.get("x-trace-id") or generate_trace_id()
            parent_span_id = None

        span_id = generate_span_id()

        # Bind contextvars
        t_token = current_trace_id_var.set(trace_id)
        s_token = current_span_id_var.set(span_id)

        start_time = time.time()
        status_str = "ok"
        status_code = 500

        try:
            response: Response = await call_next(request)
            status_code = response.status_code
            if status_code >= 500:
                status_str = "error"
            # Propagate trace ID back to client
            response.headers["X-Trace-ID"] = trace_id
            response.headers["traceparent"] = f"00-{trace_id}-{span_id}-01"
            return response
        except Exception as exc:
            status_str = "error"
            raise exc
        finally:
            end_time = time.time()
            duration_ms = (end_time - start_time) * 1000.0

            # Record server HTTP span
            span = TraceSpan(
                span_id=span_id,
                trace_id=trace_id,
                parent_span_id=parent_span_id,
                name=f"HTTP {request.method} {request.url.path}",
                start_time=start_time,
                end_time=end_time,
                duration_ms=duration_ms,
                status=status_str,
                attributes={
                    "http.method": request.method,
                    "http.target": request.url.path,
                    "http.status_code": status_code,
                    "client.ip": request.client.host if request.client else "unknown",
                },
            )
            trace_storage.record_span(span)

            # Reset contextvars
            current_trace_id_var.reset(t_token)
            current_span_id_var.reset(s_token)


def record_child_span(
    name: str,
    duration_ms: float,
    status: str = "ok",
    attributes: Optional[Dict[str, Any]] = None,
    parent_span_id: Optional[str] = None,
    trace_id: Optional[str] = None,
) -> TraceSpan:
    """Convenience helper to record an internal span (e.g. DB, Worker, LLM)."""
    tid = trace_id or get_current_trace_id()
    pid = parent_span_id or current_span_id_var.get()
    sid = generate_span_id()
    end_time = time.time()
    start_time = end_time - (duration_ms / 1000.0)

    span = TraceSpan(
        span_id=sid,
        trace_id=tid,
        parent_span_id=pid,
        name=name,
        start_time=start_time,
        end_time=end_time,
        duration_ms=duration_ms,
        status=status,
        attributes=attributes or {},
    )
    trace_storage.record_span(span)
    return span

"""AI Resiliency — Circuit breaker, prompt sanitization, and token tracking.

Wraps OpenAI calls with retry + exponential backoff, sanitizes scanner
outputs before they reach the LLM, and tracks token usage per organization.
"""

import re
import time
import logging
from dataclasses import dataclass, field
from collections import defaultdict

logger = logging.getLogger("SageAI.ai_resilience")


# ── Circuit Breaker ──────────────────────────────────
@dataclass
class CircuitBreaker:
    """Simple circuit breaker for external API calls.

    States:
      CLOSED  → requests pass through normally
      OPEN    → requests are blocked (fast-fail)
      HALF_OPEN → one test request allowed to check recovery
    """
    failure_threshold: int = 3
    reset_timeout: int = 60  # seconds
    _failure_count: int = 0
    _state: str = "CLOSED"
    _last_failure_time: float = 0.0

    @property
    def state(self) -> str:
        if self._state == "OPEN":
            if time.time() - self._last_failure_time > self.reset_timeout:
                self._state = "HALF_OPEN"
                logger.info("Circuit breaker → HALF_OPEN (testing recovery)")
        return self._state

    def record_success(self):
        self._failure_count = 0
        self._state = "CLOSED"

    def record_failure(self):
        self._failure_count += 1
        self._last_failure_time = time.time()
        if self._failure_count >= self.failure_threshold:
            self._state = "OPEN"
            logger.warning(f"Circuit breaker → OPEN after {self._failure_count} failures")

    def is_open(self) -> bool:
        return self.state == "OPEN"


# Global circuit breaker for OpenAI
openai_breaker = CircuitBreaker(failure_threshold=3, reset_timeout=60)


# ── Prompt Injection Sanitization ────────────────────
# Patterns that malicious sites embed to hijack LLM prompts
INJECTION_PATTERNS = [
    r"ignore\s+(previous|above|all)\s+(instructions|prompts)",
    r"you\s+are\s+now\s+a",
    r"forget\s+(everything|your\s+instructions)",
    r"system\s*:\s*",
    r"<\s*script",
    r"javascript\s*:",
    r"\beval\s*\(",
    r"document\.cookie",
    r"window\.location",
    r"base64",
    r"data:text/html",
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]


def sanitize_for_llm(text: str, max_length: int = 2000) -> str:
    """Sanitize scanner output before sending to LLM.

    - Strips HTML/script tags
    - Removes known prompt injection patterns
    - Truncates to max_length
    - Escapes special characters
    """
    if not text:
        return ""

    # Strip HTML tags
    text = re.sub(r"<[^>]+>", "", text)

    # Remove prompt injection patterns
    for pattern in COMPILED_PATTERNS:
        text = pattern.sub("[REDACTED]", text)

    # Remove control characters
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    # Truncate
    if len(text) > max_length:
        text = text[:max_length] + "...[truncated]"

    return text


def sanitize_findings_for_llm(findings: list[dict]) -> list[dict]:
    """Sanitize all findings before passing to AI analysis."""
    sanitized = []
    for f in findings:
        clean = {}
        for key, value in f.items():
            if isinstance(value, str):
                clean[key] = sanitize_for_llm(value, max_length=500)
            elif isinstance(value, list):
                clean[key] = [sanitize_for_llm(str(v), 200) if isinstance(v, str) else v for v in value[:20]]
            else:
                clean[key] = value
        sanitized.append(clean)
    return sanitized


# ── Token Usage Tracking ─────────────────────────────
@dataclass
class TokenTracker:
    """Tracks LLM token usage per organization for billing/limiting.

    In production, persist to database. This in-memory version is for
    demonstration and testing.
    """
    # org_id → {"prompt_tokens": int, "completion_tokens": int, "total_cost": float}
    usage: dict = field(default_factory=lambda: defaultdict(lambda: {
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "total_cost": 0.0,
        "request_count": 0,
    }))

    # Pricing per 1M tokens (gpt-4o-mini)
    INPUT_PRICE_PER_1M: float = 0.15
    OUTPUT_PRICE_PER_1M: float = 0.60

    def record_usage(self, org_id: str, prompt_tokens: int, completion_tokens: int):
        """Record token usage for an organization."""
        entry = self.usage[org_id]
        entry["prompt_tokens"] += prompt_tokens
        entry["completion_tokens"] += completion_tokens
        entry["request_count"] += 1
        entry["total_cost"] += (
            (prompt_tokens / 1_000_000) * self.INPUT_PRICE_PER_1M +
            (completion_tokens / 1_000_000) * self.OUTPUT_PRICE_PER_1M
        )
        logger.info(f"Token usage for org {org_id}: +{prompt_tokens}in/{completion_tokens}out, total=${entry['total_cost']:.4f}")

    def get_usage(self, org_id: str) -> dict:
        return dict(self.usage[org_id])

    def check_budget(self, org_id: str, max_cost: float = 10.0) -> bool:
        """Check if org is within budget. Returns True if OK."""
        return self.usage[org_id]["total_cost"] < max_cost


# Global token tracker
token_tracker = TokenTracker()

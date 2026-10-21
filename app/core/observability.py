import logging
import os
import sys
from typing import Any

import structlog
from prometheus_client import Counter

# --- Custom Metrics ---
# Request duration is usually handled by prometheus-fastapi-instrumentator,
# but we can track specific operation durations if needed.
SCAN_COUNT_TOTAL = Counter(
    "sageai_scan_count_total", "Total number of security scans executed", ["status"]
)

LLM_TOKEN_USAGE_TOTAL = Counter(
    "sageai_llm_token_usage_total",
    "Total number of LLM tokens used",
    ["provider", "model"],
)


# --- Sentry Setup ---
def setup_sentry():
    SENTRY_DSN = os.getenv("SENTRY_DSN")
    if SENTRY_DSN:
        import sentry_sdk

        sentry_sdk.init(
            dsn=SENTRY_DSN,
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.2")),
            profiles_sample_rate=float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "0.1")),
            environment=os.getenv("ENV", "development"),
        )
        return True
    return False


# --- Structured Logging Setup ---
def setup_logging():
    """Configure structured JSON logging using structlog."""
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    if hasattr(sys.stderr, "reconfigure"):
        try:
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    log_level = os.getenv("LOG_LEVEL", "INFO").upper()

    # Configure standard logging to use structlog
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, log_level),
    )

    processors: list[Any] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    # Use JSONRenderer in production, ConsoleRenderer in development
    if os.getenv("ENV", "development") == "production":
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer())

    structlog.configure(
        processors=processors,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    return structlog.get_logger("SageAI")


# Initialize global logger
logger = setup_logging()

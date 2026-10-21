import logging
import sys
from typing import Any

import structlog
from asgi_correlation_id import correlation_id


def configure_logging(env: str = "development"):
    """
    Configures standard library logging and structlog to output JSON.
    Uses asgi-correlation-id to inject request IDs into logs.
    """
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

    # Define common processors
    processors: list[Any] = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        # Inject correlation ID
        structlog.contextvars.merge_contextvars,
    ]

    # Redact sensitive credentials and tokens
    def redact_sensitive_data(logger, method_name, event_dict):
        sensitive_keys = {
            "password",
            "new_password",
            "current_password",
            "secret",
            "api_key",
            "token",
            "access_token",
            "refresh_token",
            "authorization",
            "mfa_secret",
            "backup_codes",
        }
        for key in list(event_dict.keys()):
            if any(s in key.lower() for s in sensitive_keys):
                event_dict[key] = "[REDACTED]"
        return event_dict

    # Add correlation ID dynamically
    def add_correlation(logger, method_name, event_dict):
        req_id = correlation_id.get()
        if req_id:
            event_dict["request_id"] = req_id
        return event_dict

    processors.insert(2, redact_sensitive_data)
    processors.insert(3, add_correlation)

    if env == "production":
        processors.append(structlog.processors.JSONRenderer())
        formatter = structlog.stdlib.ProcessorFormatter(
            processor=structlog.processors.JSONRenderer(),
        )
    else:
        processors.append(structlog.dev.ConsoleRenderer(colors=True))
        formatter = structlog.stdlib.ProcessorFormatter(
            processor=structlog.dev.ConsoleRenderer(colors=True),
        )

    # Configure stdlib logging
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)

    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            *processors,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # Suppress verbose loggers
    logging.getLogger("uvicorn.access").handlers.clear()
    logging.getLogger("uvicorn.error").handlers.clear()
    logging.getLogger("httpx").setLevel(logging.WARNING)

    return structlog.get_logger()

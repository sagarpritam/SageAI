import logging
import sys

import structlog
from asgi_correlation_id import correlation_id


def configure_logging(env: str = "development"):
    """
    Configures standard library logging and structlog to output JSON.
    Uses asgi-correlation-id to inject request IDs into logs.
    """
    # Define common processors
    processors = [
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        # Inject correlation ID
        structlog.contextvars.merge_contextvars,
    ]

    # Add correlation ID dynamically
    def add_correlation(logger, method_name, event_dict):
        req_id = correlation_id.get()
        if req_id:
            event_dict["request_id"] = req_id
        return event_dict

    processors.insert(2, add_correlation)

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

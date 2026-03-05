import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.database import init_db
from app.routers import auth_routes, scan_routes, report_routes, explain_routes, org_routes, apikey_routes, webhook_routes, billing_routes, schedule_routes, mfa_routes, password_routes, ws_routes
from app.middleware.audit import AuditLogMiddleware
from app.middleware.security import SecurityHeadersMiddleware

# ---------------------
# Sentry (Error Tracking)
# ---------------------
SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    import sentry_sdk
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        traces_sample_rate=0.2,
        profiles_sample_rate=0.1,
        environment=os.getenv("ENV", "development"),
    )

# ---------------------
# Logging
# ---------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("SageAI")

# ---------------------
# Rate Limiter
# ---------------------
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT])


# ---------------------
# Lifespan (startup/shutdown)
# ---------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting SageAI Security Scanner...")

    # Production config validation
    errors = settings.validate_production()
    for err in errors:
        logger.critical(f"⛔ {err}")
    if any("CRITICAL" in e for e in errors):
        raise RuntimeError("Production config validation failed. Fix critical errors above.")

    await init_db()
    logger.info("✅ Database tables created")
    yield
    logger.info("👋 Shutting down SageAI")


# ---------------------
# App
# ---------------------
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered security scanning SaaS platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — uses configurable origins, not wildcard
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers (HSTS, CSP, X-Frame-Options)
app.add_middleware(SecurityHeadersMiddleware)

# GDPR-compliant audit logging
app.add_middleware(AuditLogMiddleware)

# Prometheus metrics (exposes /metrics endpoint)
try:
    from prometheus_fastapi_instrumentator import Instrumentator
    Instrumentator(
        should_group_status_codes=True,
        should_ignore_untemplated=True,
        excluded_handlers=["/metrics", "/"],
    ).instrument(app).expose(app, endpoint="/metrics", tags=["Monitoring"])
    logger.info("📊 Prometheus metrics enabled at /metrics")
except ImportError:
    logger.warning("⚠️  prometheus-fastapi-instrumentator not installed — metrics disabled")


# ---------------------
# Request Logging Middleware
# ---------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"➡️  {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"⬅️  {request.method} {request.url.path} → {response.status_code}")
    return response


# ---------------------
# Routers
# ---------------------
app.include_router(auth_routes.router)
app.include_router(scan_routes.router)
app.include_router(report_routes.router)
app.include_router(explain_routes.router)
app.include_router(org_routes.router)
app.include_router(apikey_routes.router)
app.include_router(webhook_routes.router)
app.include_router(billing_routes.router)
app.include_router(schedule_routes.router)
app.include_router(mfa_routes.router)
app.include_router(password_routes.router)
app.include_router(ws_routes.router)


# ---------------------
# Health Check
# ---------------------
@app.get("/", tags=["Health"])
async def health_check():
    """Production-grade health check with DB connectivity."""
    db_ok = True
    try:
        from sqlalchemy import text
        from app.core.database import AsyncSessionLocal
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "environment": settings.ENV,
        "database": "connected" if db_ok else "unreachable",
        "scanners": 11,
        "endpoints": 31,
    }

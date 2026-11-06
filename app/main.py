import asyncio
from contextlib import asynccontextmanager
from typing import Any, cast

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.config import settings
from app.core.database import init_db

# ---------------------
# Observability
# ---------------------
from app.core.observability import logger, setup_sentry
from app.core.telemetry import TracingMiddleware
from app.middleware.audit import AuditLogMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.routers import (
    adversary_routes,
    agent_routes,
    ai_chat_routes,
    ai_command_routes,
    ai_depoison_routes,
    ai_immune_routes,
    ai_soc_routes,
    ai_spm_routes,
    airgap_llm_guard_routes,
    api_shield_routes,
    apikey_routes,
    apt_attribution_routes,
    asm_routes,
    asset_routes,
    atomic_redteam_routes,
    auth_routes,
    autofix_routes,
    binary_deobfuscator_routes,
    billing_routes,
    bloodhound_routes,
    canary_fabric_routes,
    cart_routes,
    cas_redteam_swarm_routes,
    ci_routes,
    cloud_forensics_routes,
    consensus_routes,
    copilot_routes,
    cspm_routes,
    crossplane_mesh_routes,
    cti_routes,
    d3fend_routes,
    darkweb_radar_routes,
    deception_routes,
    deep_analysis_routes,
    drone_swarm_shield_routes,
    dspm_routes,
    email_report_routes,
    easm_routes,
    ebpf_routes,
    enclave_attestation_routes,
    enclave_routes,
    enterprise_routes,
    explain_routes,
    firmware_attestation_routes,
    forensics_routes,
    gdpr_routes,
    iac_drift_routes,
    incident_routes,
    industrial_scada_routes,
    intergrid_failover_routes,
    integration_routes,
    intelligence_hub_routes,
    intrusion_routes,
    itdr_routes,
    kms_hsm_routes,
    kyber_mesh_vpn_routes,
    labyrinth_honeynet_routes,
    malware_routes,
    mfa_routes,
    micro_hotpatch_routes,
    neural_bci_routes,
    notification_routes,
    org_routes,
    orbital_laser_routes,
    password_routes,
    payment_routes,
    posture_routes,
    pqc_routes,
    ransomware_routes,
    redteam_routes,
    regulatory_commander_routes,
    report_routes,
    rule_synthesizer_routes,
    sbom_vex_routes,
    scan_routes,
    schedule_routes,
    sdn_shield_routes,
    simulation_routes,
    space_ground_qkd_routes,
    sso_routes,
    subsea_cable_routes,
    supply_chain_routes,
    telecom_5g_routes,
    telemetry_routes,
    threat_hunting_routes,
    threat_hunting_swarm_routes,
    threat_modeling_routes,
    web3_security_routes,
    webhook_routes,
    workload_identity_routes,
    ws_routes,
    zkp_routes,
    ztna_routes,
)
from app.services.warroom_service import warroom_manager

setup_sentry()

# ---------------------
# Rate Limiter
# ---------------------
from app.core.rate_limit import limiter


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
        raise RuntimeError(
            "Production config validation failed. Fix critical errors above."
        )

    await init_db()
    logger.info("✅ Database tables created (v2.0)")

    # Start War Room Manager
    asyncio.create_task(warroom_manager.start())
    logger.info("📡 War Room Manager started (background)")

    yield
    logger.info("👋 Shutting down SageAI v2.0")


# ---------------------
# App
# ---------------------
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Attack Surface Management & Security Platform",
    version="2.0.0",
    lifespan=lifespan,
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, cast(Any, _rate_limit_exceeded_handler))
app.add_middleware(SlowAPIMiddleware)

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

# Distributed tracing & W3C traceparent propagation
app.add_middleware(TracingMiddleware)

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
    logger.warning(
        "⚠️  prometheus-fastapi-instrumentator not installed — metrics disabled"
    )


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
app.include_router(ai_chat_routes.router)
app.include_router(ai_command_routes.router)
app.include_router(integration_routes.router)
app.include_router(autofix_routes.router)
app.include_router(asset_routes.router)
app.include_router(agent_routes.router)
app.include_router(intelligence_hub_routes.router, prefix="/intelligence")
app.include_router(intelligence_hub_routes.router, prefix="/intel")
app.include_router(asm_routes.router)
app.include_router(redteam_routes.router)
app.include_router(payment_routes.router)
app.include_router(posture_routes.router)
app.include_router(posture_routes.compliance_router)
app.include_router(gdpr_routes.router)
app.add_api_route(
    "/export", gdpr_routes.export_data, methods=["GET", "POST"], tags=["Compliance"]
)
app.include_router(email_report_routes.router)
app.include_router(notification_routes.router)
app.include_router(ci_routes.router)
app.include_router(copilot_routes.router)
app.include_router(copilot_routes.threat_feed_router)
app.include_router(telemetry_routes.router)
app.include_router(deception_routes.router)
app.include_router(incident_routes.router)
app.include_router(consensus_routes.router)
app.include_router(deep_analysis_routes.router)
app.include_router(malware_routes.router)
app.include_router(rule_synthesizer_routes.router)
app.include_router(intrusion_routes.router)
app.include_router(simulation_routes.router)
app.include_router(enterprise_routes.router)
app.include_router(enclave_routes.router)
app.include_router(sso_routes.router)
app.include_router(threat_modeling_routes.router)
app.include_router(pqc_routes.router)
app.include_router(ebpf_routes.router)
app.include_router(cspm_routes.router)
app.include_router(supply_chain_routes.router)
app.include_router(ztna_routes.router)
app.include_router(adversary_routes.router)
app.include_router(easm_routes.router)
app.include_router(ai_soc_routes.router)
app.include_router(threat_hunting_routes.router)
app.include_router(ransomware_routes.router)
app.include_router(dspm_routes.router)
app.include_router(cti_routes.router)
app.include_router(atomic_redteam_routes.router)
app.include_router(iac_drift_routes.router)
app.include_router(sbom_vex_routes.router)
app.include_router(itdr_routes.router)
app.include_router(cart_routes.router)
app.include_router(ai_spm_routes.router)
app.include_router(kms_hsm_routes.router)
app.include_router(bloodhound_routes.router)
app.include_router(forensics_routes.router)
app.include_router(api_shield_routes.router)
app.include_router(web3_security_routes.router)
app.include_router(sdn_shield_routes.router)
app.include_router(darkweb_radar_routes.router)
app.include_router(zkp_routes.router)
app.include_router(d3fend_routes.router)
app.include_router(enclave_attestation_routes.router)
app.include_router(threat_hunting_swarm_routes.router)
app.include_router(canary_fabric_routes.router)
app.include_router(binary_deobfuscator_routes.router)
app.include_router(workload_identity_routes.router)
app.include_router(micro_hotpatch_routes.router)
app.include_router(cas_redteam_swarm_routes.router)
app.include_router(apt_attribution_routes.router)
app.include_router(cloud_forensics_routes.router)
app.include_router(crossplane_mesh_routes.router)
app.include_router(kyber_mesh_vpn_routes.router)
app.include_router(labyrinth_honeynet_routes.router)
app.include_router(airgap_llm_guard_routes.router)
app.include_router(firmware_attestation_routes.router)
app.include_router(industrial_scada_routes.router)
app.include_router(regulatory_commander_routes.router)
app.include_router(telecom_5g_routes.router)
app.include_router(orbital_laser_routes.router)
app.include_router(ai_immune_routes.router)
app.include_router(subsea_cable_routes.router)
app.include_router(neural_bci_routes.router)
app.include_router(intergrid_failover_routes.router)
app.include_router(ai_depoison_routes.router)
app.include_router(space_ground_qkd_routes.router)
app.include_router(drone_swarm_shield_routes.router)


# ---------------------
# Health Check
# ---------------------
@app.get("/", tags=["Health"])
@app.get("/health", tags=["Health"])
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
        "version": "2.0.0",
        "environment": settings.ENV,
        "database": "connected" if db_ok else "unreachable",
        "scanners": 11,
        "intelligence_modules": 10,
        "endpoints": 65,
        "new_in_v2": [
            "Asset Inventory",
            "Attack Surface Management",
            "AI Copilot",
            "Bug Bounty Reports",
            "Multi-Agent AI Team",
            "Security Knowledge Graph",
            "Plugin Marketplace",
        ],
        "new_in_v3": [
            "Shodan Panopticon",
            "Maltego Link Analysis",
            "Babel X Dark Web",
            "SpiderFoot Recon",
            "Social Links De-Masking",
            "Intel X Archives",
            "Recon-ng Framework",
            "Censys Global Radar",
            "OSINT Industries Interceptor",
            "Deep Search: The Abyss",
        ],
    }

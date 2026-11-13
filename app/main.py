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
    airgap_exploit_routes,
    airgap_llm_guard_routes,
    alcubierre_lentz_warp_routes,
    algebraic_qft_routes,
    altermagnetic_supergrid_routes,
    amplituhedron_scattering_routes,
    antimatter_containment_routes,
    antimatter_fusion_routes,
    anyon_braiding_routes,
    api_shield_routes,
    apikey_routes,
    apt_attribution_routes,
    asm_routes,
    asset_routes,
    asymptotic_safety_routes,
    atomic_clock_routes,
    atomic_redteam_routes,
    auth_routes,
    autofix_routes,
    axion_haloscope_routes,
    beilinson_drinfeld_routes,
    berry_curvature_routes,
    billing_routes,
    binary_deobfuscator_routes,
    bloch_schwinger_routes,
    bloodhound_routes,
    bv_brst_routes,
    calabi_yau_routes,
    canary_fabric_routes,
    carrollian_holography_routes,
    cart_routes,
    cas_redteam_swarm_routes,
    casimir_sagnac_routes,
    casimir_vacuum_routes,
    cauchy_chronology_routes,
    causal_set_lattice_routes,
    celestial_holography_routes,
    centesimal_quantum_gravity_routes,
    cft_defect_bcft_routes,
    chern_simons_tqft_routes,
    chromatic_morava_routes,
    ci_routes,
    cislunar_relay_routes,
    cloud_forensics_routes,
    cluster_associahedron_routes,
    cluster_federation_routes,
    cognitive_ew_routes,
    complexity_holography_routes,
    condensed_liquid_routes,
    conformal_bootstrap_routes,
    consensus_routes,
    copilot_routes,
    cosmic_censorship_routes,
    counter_quantum_routes,
    crossplane_mesh_routes,
    cspm_routes,
    cti_routes,
    d3fend_routes,
    dark_energy_routes,
    darkweb_radar_routes,
    dbrane_tadpole_routes,
    deception_routes,
    deep_analysis_routes,
    deep_crustal_mhd_routes,
    deep_space_laser_routes,
    derived_symplectic_routes,
    desitter_repulsion_routes,
    donaldson_thomas_routes,
    drone_swarm_shield_routes,
    ds_static_patch_routes,
    dspm_routes,
    easm_routes,
    ebpf_routes,
    email_report_routes,
    enclave_attestation_routes,
    enclave_routes,
    entanglement_wedge_routes,
    enterprise_routes,
    er_bridge_routes,
    ergosphere_spin_routes,
    everett_branch_routes,
    explain_routes,
    factorization_homology_routes,
    false_vacuum_routes,
    fibonacci_anyon_routes,
    firmware_attestation_routes,
    floer_novikov_routes,
    forensics_routes,
    fukaya_floer_routes,
    gdpr_routes,
    geomagnetic_shield_routes,
    geometric_langlands_routes,
    geometric_satake_routes,
    gravitational_seismic_routes,
    happy_holographic_routes,
    haps_stratosphere_routes,
    higher_form_twogroup_routes,
    hitchin_moduli_routes,
    homotopy_univalence_routes,
    horava_lifshitz_routes,
    hypersonic_defense_routes,
    hyperspectral_interceptor_routes,
    iac_drift_routes,
    incident_routes,
    industrial_scada_routes,
    infinity_cobordism_routes,
    inflaton_reheating_routes,
    integration_routes,
    intelligence_hub_routes,
    intergrid_failover_routes,
    intrusion_routes,
    itdr_routes,
    jt_wormhole_routes,
    kagome_supergrid_routes,
    khovanov_foam_routes,
    kms_hsm_routes,
    ktheory_dbrane_routes,
    kugelblitz_hawking_routes,
    kyber_mesh_vpn_routes,
    labyrinth_honeynet_routes,
    m_theory_g2_routes,
    magneto_inertial_fusion_routes,
    magnetosphere_dynamo_routes,
    majorana_supergrid_routes,
    malware_routes,
    mantle_geoneutrino_routes,
    marine_sonar_routes,
    matrix_bfss_routes,
    mera_tensor_routes,
    mfa_routes,
    mhd_plasma_stealth_routes,
    micro_hotpatch_routes,
    mirror_symmetry_routes,
    modular_bootstrap_routes,
    monopole_battery_routes,
    motivic_galois_routes,
    muon_tomography_routes,
    neural_bci_routes,
    neuromorphic_snn_routes,
    neutrino_array_routes,
    non_invertible_symtft_routes,
    noncommutative_spacetime_routes,
    notification_routes,
    novikov_geodesic_routes,
    operadic_bar_cobar_routes,
    orbital_debris_routes,
    orbital_hpm_routes,
    orbital_laser_routes,
    org_routes,
    p_adic_holography_routes,
    password_routes,
    payment_routes,
    photonic_quantum_routes,
    plasma_shield_routes,
    posture_routes,
    pqc_routes,
    qkd_space_mesh_routes,
    quantum_cohomology_routes,
    quantum_extremal_island_routes,
    quantum_gravitational_routes,
    quantum_thermoelectric_routes,
    quantum_yangian_routes,
    randall_sundrum_routes,
    ransomware_routes,
    redteam_cluster_routes,
    redteam_routes,
    regulatory_commander_routes,
    report_routes,
    resurgence_transseries_routes,
    rule_synthesizer_routes,
    ryu_takayanagi_routes,
    sbom_vex_routes,
    scan_routes,
    schedule_routes,
    schwinger_vacuum_routes,
    sdn_shield_routes,
    simulation_routes,
    singularity_containment_routes,
    skyrmion_instanton_routes,
    solar_sail_laser_routes,
    space_ground_qkd_routes,
    spectral_scheme_routes,
    spin_caloritronic_routes,
    spin_foam_routes,
    sso_routes,
    string_field_theory_routes,
    subfactor_jones_routes,
    subsea_cable_routes,
    supply_chain_routes,
    swampland_wgc_routes,
    syk_chaos_routes,
    tachyon_horizon_routes,
    telecom_5g_routes,
    telemetry_routes,
    teleparallel_gravity_routes,
    threat_hunting_routes,
    threat_hunting_swarm_routes,
    threat_modeling_routes,
    time_crystal_routes,
    tmf_cohomology_routes,
    topos_grothendieck_routes,
    twisted_supergrid_routes,
    twistor_holonomy_routes,
    unruh_rindler_routes,
    web3_security_routes,
    webhook_routes,
    weyl_supergrid_routes,
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
    logger.info("✅ Database schema verified (v2.0)")

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
    "/export", gdpr_routes.export_data, methods=["GET"], tags=["Compliance"]
)
app.add_api_route(
    "/export", gdpr_routes.export_data, methods=["POST"], tags=["Compliance"]
)
app.include_router(email_report_routes.router)
app.include_router(notification_routes.router)
app.include_router(notification_routes.inbox_router)
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
app.include_router(neuromorphic_snn_routes.router)
app.include_router(deep_space_laser_routes.router)
app.include_router(hypersonic_defense_routes.router)
app.include_router(photonic_quantum_routes.router)
app.include_router(geomagnetic_shield_routes.router)
app.include_router(haps_stratosphere_routes.router)
app.include_router(marine_sonar_routes.router)
app.include_router(orbital_debris_routes.router)
app.include_router(airgap_exploit_routes.router)
app.include_router(neutrino_array_routes.router)
app.include_router(cognitive_ew_routes.router)
app.include_router(atomic_clock_routes.router)
app.include_router(gravitational_seismic_routes.router)
app.include_router(counter_quantum_routes.router)
app.include_router(plasma_shield_routes.router)
app.include_router(cislunar_relay_routes.router)
app.include_router(muon_tomography_routes.router)
app.include_router(antimatter_containment_routes.router)
app.include_router(redteam_cluster_routes.router)
app.include_router(solar_sail_laser_routes.router)
app.include_router(magnetosphere_dynamo_routes.router)
app.include_router(mantle_geoneutrino_routes.router)
app.include_router(quantum_gravitational_routes.router)
app.include_router(tachyon_horizon_routes.router)
app.include_router(singularity_containment_routes.router)
app.include_router(cluster_federation_routes.router)
app.include_router(dark_energy_routes.router)
app.include_router(casimir_vacuum_routes.router)
app.include_router(anyon_braiding_routes.router)
app.include_router(qkd_space_mesh_routes.router)
app.include_router(desitter_repulsion_routes.router)
app.include_router(calabi_yau_routes.router)
app.include_router(cauchy_chronology_routes.router)
app.include_router(hyperspectral_interceptor_routes.router)
app.include_router(everett_branch_routes.router)
app.include_router(er_bridge_routes.router)
app.include_router(false_vacuum_routes.router)
app.include_router(orbital_hpm_routes.router)
app.include_router(inflaton_reheating_routes.router)
app.include_router(randall_sundrum_routes.router)
app.include_router(cosmic_censorship_routes.router)
app.include_router(deep_crustal_mhd_routes.router)
app.include_router(ryu_takayanagi_routes.router)
app.include_router(dbrane_tadpole_routes.router)
app.include_router(novikov_geodesic_routes.router)
app.include_router(mhd_plasma_stealth_routes.router)
app.include_router(asymptotic_safety_routes.router)
app.include_router(horava_lifshitz_routes.router)
app.include_router(centesimal_quantum_gravity_routes.router)
app.include_router(magneto_inertial_fusion_routes.router)
app.include_router(teleparallel_gravity_routes.router)
app.include_router(spin_foam_routes.router)
app.include_router(noncommutative_spacetime_routes.router)
app.include_router(antimatter_fusion_routes.router)
app.include_router(string_field_theory_routes.router)
app.include_router(mirror_symmetry_routes.router)
app.include_router(fibonacci_anyon_routes.router)
app.include_router(monopole_battery_routes.router)
app.include_router(m_theory_g2_routes.router)
app.include_router(happy_holographic_routes.router)
app.include_router(ktheory_dbrane_routes.router)
app.include_router(kugelblitz_hawking_routes.router)
app.include_router(amplituhedron_scattering_routes.router)
app.include_router(twistor_holonomy_routes.router)
app.include_router(causal_set_lattice_routes.router)
app.include_router(schwinger_vacuum_routes.router)
app.include_router(chern_simons_tqft_routes.router)
app.include_router(quantum_extremal_island_routes.router)
app.include_router(geometric_langlands_routes.router)
app.include_router(alcubierre_lentz_warp_routes.router)
app.include_router(celestial_holography_routes.router)
app.include_router(non_invertible_symtft_routes.router)
app.include_router(conformal_bootstrap_routes.router)
app.include_router(axion_haloscope_routes.router)
app.include_router(swampland_wgc_routes.router)
app.include_router(syk_chaos_routes.router)
app.include_router(tmf_cohomology_routes.router)
app.include_router(ergosphere_spin_routes.router)
app.include_router(complexity_holography_routes.router)
app.include_router(carrollian_holography_routes.router)
app.include_router(modular_bootstrap_routes.router)
app.include_router(casimir_sagnac_routes.router)
app.include_router(jt_wormhole_routes.router)
app.include_router(ds_static_patch_routes.router)
app.include_router(higher_form_twogroup_routes.router)
app.include_router(unruh_rindler_routes.router)
app.include_router(matrix_bfss_routes.router)
app.include_router(cft_defect_bcft_routes.router)
app.include_router(entanglement_wedge_routes.router)
app.include_router(bloch_schwinger_routes.router)
app.include_router(mera_tensor_routes.router)
app.include_router(algebraic_qft_routes.router)
app.include_router(skyrmion_instanton_routes.router)
app.include_router(time_crystal_routes.router)
app.include_router(subfactor_jones_routes.router)
app.include_router(bv_brst_routes.router)
app.include_router(p_adic_holography_routes.router)
app.include_router(spin_caloritronic_routes.router)
app.include_router(topos_grothendieck_routes.router)
app.include_router(motivic_galois_routes.router)
app.include_router(resurgence_transseries_routes.router)
app.include_router(berry_curvature_routes.router)
app.include_router(factorization_homology_routes.router)
app.include_router(condensed_liquid_routes.router)
app.include_router(derived_symplectic_routes.router)
app.include_router(quantum_thermoelectric_routes.router)
app.include_router(hitchin_moduli_routes.router)
app.include_router(geometric_satake_routes.router)
app.include_router(homotopy_univalence_routes.router)
app.include_router(twisted_supergrid_routes.router)
app.include_router(chromatic_morava_routes.router)
app.include_router(fukaya_floer_routes.router)
app.include_router(operadic_bar_cobar_routes.router)
app.include_router(kagome_supergrid_routes.router)
app.include_router(cluster_associahedron_routes.router)
app.include_router(quantum_yangian_routes.router)
app.include_router(infinity_cobordism_routes.router)
app.include_router(altermagnetic_supergrid_routes.router)
app.include_router(khovanov_foam_routes.router)
app.include_router(spectral_scheme_routes.router)
app.include_router(quantum_cohomology_routes.router)
app.include_router(weyl_supergrid_routes.router)
app.include_router(donaldson_thomas_routes.router)
app.include_router(floer_novikov_routes.router)
app.include_router(beilinson_drinfeld_routes.router)
app.include_router(majorana_supergrid_routes.router)


# ---------------------
# Health Check
# ---------------------
@app.get("/", tags=["Health"])
@app.get("/health", tags=["Health"])
async def health_check():
    """Production-grade health check with DB connectivity and connection pool telemetry."""
    from app.core.database import check_db_connectivity

    db_health = await check_db_connectivity()
    db_ok = db_health["database"] == "connected"

    return {
        "status": "healthy" if db_ok else "degraded",
        "app": settings.APP_NAME,
        "version": "2.0.0",
        "environment": settings.ENV,
        "database": db_health["database"],
        "database_latency_ms": db_health["latency_ms"],
        "database_pool": db_health["pool"],
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


@app.get("/health/ready", tags=["Health"])
@app.get("/health/db", tags=["Health"])
async def database_readiness_probe():
    """Kubernetes/container readiness probe checking database connection and query latency."""
    from app.core.database import check_db_connectivity

    return await check_db_connectivity()

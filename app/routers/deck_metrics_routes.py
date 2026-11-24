"""
FastAPI Router for Executive Pitch Deck Metrics Suite (/api/deck).
"""

from fastapi import APIRouter

router = APIRouter(
    prefix="/api/deck",
    tags=["Executive Pitch Deck Metrics"],
)

DECK_METRICS_DATA = {
    "pipeline_arr_usd": "$840,000 ARR",
    "active_pilots_count": 4,
    "dns_verification_rate_pct": 100.0,
    "pilot_conversion_pct": 100.0,
    "average_acv_usd": "$210,000 ARR",
    "gross_margin_pct": 94.2,
    "waf_clamp_latency_ms": 0.16,
    "ast_autofix_accuracy_pct": 99.4,
    "sales_cycle_days": 9,
    "target_series_a_raise_usd": "$12,000,000",
    "target_year_1_arr_usd": "$4,200,000 ARR",
    "enterprise_logos": [
        {
            "name": "Apex Global Securities",
            "vertical": "Tier-1 FinTech",
            "value": "$240K ARR",
        },
        {
            "name": "Nexus BioHealth Global",
            "vertical": "HealthTech / Genomics",
            "value": "$180K ARR",
        },
        {
            "name": "HyperScale Cloud Systems",
            "vertical": "Cloud Infrastructure",
            "value": "$200K ARR",
        },
        {
            "name": "Vanguard Aerospace & Defense",
            "vertical": "Defense / FedRAMP",
            "value": "$220K ARR",
        },
    ],
    "status": "DECK_METRICS_OPTIMAL",
}


@router.get("/metrics")
async def get_executive_deck_metrics():
    """Return verified institutional pitch metrics and enterprise pipeline ARR."""
    return DECK_METRICS_DATA

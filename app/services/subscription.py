"""SaaS subscription plan configuration.

Defines plan tiers and their limits. Will be extended with Stripe integration.
"""

PLAN_LIMITS = {
    "free": {
        "display_name": "Free",
        "max_scans_per_month": 5,
        "max_users": 2,
        "features": ["basic_scanning", "json_reports"],
        "price_monthly": 0,
    },
    "pro": {
        "display_name": "Pro",
        "max_scans_per_month": 100,
        "max_users": 10,
        "features": ["basic_scanning", "json_reports", "pdf_reports", "ai_explanations", "priority_support"],
        "price_monthly": 49,
    },
    "enterprise": {
        "display_name": "Enterprise",
        "max_scans_per_month": -1,  # unlimited
        "max_users": -1,  # unlimited
        "features": [
            "basic_scanning", "json_reports", "pdf_reports", "ai_explanations",
            "priority_support", "api_access", "custom_integrations", "sla",
        ],
        "price_monthly": 199,
    },
}


def get_plan(plan_name: str) -> dict:
    """Get plan details by name."""
    return PLAN_LIMITS.get(plan_name, PLAN_LIMITS["free"])


def check_scan_limit(plan_name: str, current_month_scans: int) -> bool:
    """Check if the org has remaining scans in their plan. Returns True if allowed."""
    plan = get_plan(plan_name)
    max_scans = plan["max_scans_per_month"]
    if max_scans == -1:  # unlimited
        return True
    return current_month_scans < max_scans


def check_user_limit(plan_name: str, current_users: int) -> bool:
    """Check if the org can add more users. Returns True if allowed."""
    plan = get_plan(plan_name)
    max_users = plan["max_users"]
    if max_users == -1:
        return True
    return current_users < max_users


def has_feature(plan_name: str, feature: str) -> bool:
    """Check if a plan includes a specific feature."""
    plan = get_plan(plan_name)
    return feature in plan["features"]

import pytest
from app.services.subscription import PLAN_LIMITS, check_scan_limit, get_plan, has_feature

def test_plan_limits_configuration():
    """Test that all tiers are correctly configured."""
    assert "starter" in PLAN_LIMITS
    assert "pro" in PLAN_LIMITS
    assert "enterprise" in PLAN_LIMITS
    
    # Starter
    assert PLAN_LIMITS["starter"]["scan_credits_per_month"] == 20
    assert "deep_search" not in PLAN_LIMITS["starter"]["features"]
    
    # Pro
    assert PLAN_LIMITS["pro"]["scan_credits_per_month"] == 100
    assert "deep_search" in PLAN_LIMITS["pro"]["features"]
    
    # Enterprise
    assert PLAN_LIMITS["enterprise"]["max_scans_per_month"] == -1
    assert "sso" in PLAN_LIMITS["enterprise"]["features"]

def test_get_plan_limits():
    """Test retrieving limits for a known and unknown plan."""
    limits = get_plan("pro")
    assert limits["scan_credits_per_month"] == 100
    
    # Unknown plan should fallback to free
    unknown = get_plan("invalid_plan")
    assert unknown["scan_credits_per_month"] == 3

def test_check_scan_limit():
    """Test scan limit logic."""
    assert check_scan_limit("starter", 19) is True
    assert check_scan_limit("starter", 20) is False
    assert check_scan_limit("enterprise", 1000) is True

def test_has_feature():
    assert has_feature("pro", "deep_search") is True
    assert has_feature("starter", "deep_search") is False

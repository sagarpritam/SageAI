"""Tests for hardened tool wrappers — input validation, mock mode, and timeouts."""

import pytest

from app.tools.nmap_wrapper import _sanitize_target, run_nmap
from app.tools.nuclei_wrapper import run_nuclei
from app.tools.subfinder_wrapper import _validate_domain, run_subfinder

# ── Subfinder Tests ──────────────────────────────────────────────


class TestSubfinderValidation:
    def test_valid_domain(self):
        assert _validate_domain("example.com") == "example.com"

    def test_strips_protocol(self):
        assert _validate_domain("https://example.com") == "example.com"
        assert _validate_domain("http://example.com/path") == "example.com"

    def test_strips_whitespace(self):
        assert _validate_domain("  Example.COM  ") == "example.com"

    def test_rejects_empty(self):
        with pytest.raises(ValueError, match="must not be empty"):
            _validate_domain("")

    def test_rejects_invalid(self):
        with pytest.raises(ValueError, match="Invalid domain"):
            _validate_domain("not a domain!")


class TestSubfinderMockMode:
    def test_returns_result_object(self):
        result = run_subfinder("example.com")
        assert result.domain == "example.com"
        assert isinstance(result.subdomains, list)
        assert len(result.subdomains) > 0
        # Without subfinder installed, should be mock
        assert result.is_mock is True

    def test_elapsed_tracked(self):
        result = run_subfinder("example.com")
        assert result.elapsed_seconds >= 0


# ── Nmap Tests ───────────────────────────────────────────────────


class TestNmapValidation:
    def test_valid_target(self):
        assert _sanitize_target("example.com") == "example.com"

    def test_strips_protocol(self):
        assert _sanitize_target("https://example.com") == "example.com"

    def test_accepts_ip(self):
        assert _sanitize_target("192.168.1.1") == "192.168.1.1"

    def test_rejects_shell_injection(self):
        with pytest.raises(ValueError, match="Invalid target"):
            _sanitize_target("example.com; rm -rf /")

    def test_rejects_empty(self):
        with pytest.raises(ValueError, match="must not be empty"):
            _sanitize_target("")


class TestNmapMockMode:
    def test_returns_hosts(self):
        result = run_nmap("example.com")
        assert "hosts" in result
        assert len(result["hosts"]) > 0
        assert result.get("is_mock") is True

    def test_profiles(self):
        result = run_nmap("example.com", profile="quick")
        assert "hosts" in result


# ── Nuclei Tests ─────────────────────────────────────────────────


class TestNucleiValidation:
    def test_rejects_invalid_severity(self):
        with pytest.raises(ValueError, match="Invalid severity"):
            run_nuclei("example.com", severity="banana")


class TestNucleiMockMode:
    def test_returns_findings(self):
        findings = run_nuclei("example.com")
        assert isinstance(findings, list)
        assert len(findings) > 0
        assert findings[0].get("is_mock") is True

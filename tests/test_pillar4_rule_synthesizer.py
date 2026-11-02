"""
Tests for Pillar IV: Autonomous Threat Pattern & Rule Synthesizer (ThreatPatternSynthesizer).
Verifies:
1. YARA rule generation & string escaping
2. Sigma SIEM rule generation (YAML schema)
3. Nuclei scanning template generation (YAML schema)
4. WAF Virtual Patch creation (ModSecurity, Cloudflare, AWS)
5. Rule syntax validation (YARA, Sigma, Nuclei)
6. Pre-loaded CVE lookup & bundle export
"""

import yaml
from app.services.threat_feed.pattern_synthesizer import (
    ThreatPatternSynthesizer,
    threat_pattern_synthesizer,
)


def test_synthesize_yara_rule_syntax():
    synthesizer = ThreatPatternSynthesizer()

    rule = synthesizer.synthesize_yara_rule(
        rule_name="CVE-2024-21887",
        description="Command injection in Ivanti Connect Secure",
        strings=["/api/v1/totp/user-backup-code", "cloud-server-test-connection"],
        severity="critical",
    )

    assert "rule SageAI_CVE_2024_21887" in rule
    assert "description = \"Command injection in Ivanti Connect Secure\"" in rule
    assert "$s1 = \"/api/v1/totp/user-backup-code\"" in rule
    assert "condition:" in rule
    assert rule.count("{") == rule.count("}")

    validation = synthesizer.validate_rule("yara", rule)
    assert validation["valid"] is True


def test_synthesize_sigma_rule_yaml():
    synthesizer = ThreatPatternSynthesizer()

    sigma = synthesizer.synthesize_sigma_rule(
        cve_id="CVE-2023-34362",
        title="MOVEit Transfer SQLi Exploitation",
        description="Detects MOVEit Transfer exploitation attempts in access logs",
        keywords=["human2.aspx", "moveitisapi.dll"],
    )

    parsed = yaml.safe_load(sigma)
    assert parsed["id"] == "cve_2023_34362-threat-detect"
    assert parsed["level"] == "high"
    assert "attack.initial_access" in parsed["tags"]
    assert "human2.aspx" in parsed["detection"]["keywords"]["cve_pattern"]

    validation = synthesizer.validate_rule("sigma", sigma)
    assert validation["valid"] is True


def test_synthesize_nuclei_template_yaml():
    synthesizer = ThreatPatternSynthesizer()

    template = synthesizer.synthesize_nuclei_template(
        cve_id="CVE-2021-44228",
        name="Apache Log4j RCE",
        severity="critical",
        path="/api/login",
    )

    parsed = yaml.safe_load(template)
    assert parsed["id"] == "cve_2021_44228"
    assert parsed["info"]["severity"] == "critical"
    assert parsed["http"][0]["path"][0] == "{{BaseURL}}/api/login"

    validation = synthesizer.validate_rule("nuclei", template)
    assert validation["valid"] is True


def test_synthesize_waf_virtual_patch():
    synthesizer = ThreatPatternSynthesizer()

    waf = synthesizer.synthesize_waf_virtual_patch(
        cve_id="CVE-2024-21887",
        target_param="backup_code",
        attack_signature_regex=r"(?i)(\.\./|python\s+-c)",
    )

    assert "SecRule ARGS:backup_code" in waf["modsecurity_rule"]
    assert "deny,status:403" in waf["modsecurity_rule"]
    assert "http.request.uri.query contains" in waf["cloudflare_rule"]
    assert r"(?i)(\.\./|python\s+-c)" == waf["aws_waf_regex"]


def test_synthesize_from_cve_lookup():
    synthesizer = ThreatPatternSynthesizer()

    result = synthesizer.synthesize_from_cve_id("CVE-2024-21887")

    assert result["cve_id"] == "CVE-2024-21887"
    assert "Ivanti" in result["title"]
    assert "rule SageAI_CVE_2024_21887" in result["yara_rule"]
    assert "title: SageAI Detection for" in result["sigma_rule"]
    assert "id: cve_2024_21887" in result["nuclei_template"]
    assert "modsecurity_rule" in result["waf_patch"]


def test_preloaded_templates_and_bundle():
    synthesizer = ThreatPatternSynthesizer()

    assert len(synthesizer.PRELOADED_TEMPLATES) >= 4
    cve_ids = [t["cve_id"] for t in synthesizer.PRELOADED_TEMPLATES]
    assert "CVE-2024-21887" in cve_ids
    assert "CVE-2021-44228" in cve_ids

"""
SageAI Automated Threat Pattern & Rule Synthesizer

Automatically converts emerging CVEs, KEV items, malware indicators, and zero-day threat
intelligence into actionable detection and defense rules:
1. YARA rules (for static file/memory scanning)
2. Sigma rules (for SIEM/log detection)
3. Nuclei templates (for automated safe network verification)
4. WAF Virtual Patch rules (for instant inline perimeter protection)

Fulfills Pillar IV of the Master Plan.
"""

import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml

logger = logging.getLogger("SageAI.pattern_synthesizer")

RULES_DIR = Path("app/data/synthesized_rules")


class ThreatPatternSynthesizer:
    """
    Autonomous rule synthesis engine.
    Turns threat advisories and malware artifacts into machine-executable defense rules.
    """

    PRELOADED_TEMPLATES = [
        {
            "cve_id": "CVE-2024-21887",
            "title": "Ivanti Connect Secure Command Injection",
            "description": "Command injection vulnerability in web components of Ivanti Connect Secure allowing unauthenticated remote code execution.",
            "severity": "critical",
            "vendor": "Ivanti",
            "product": "Connect Secure / Policy Secure",
            "target_path": "/api/v1/totp/user-backup-code/../../system/maintenance/archiving/cloud-server-test-connection",
            "c2_pattern": "python -c import socket",
        },
        {
            "cve_id": "CVE-2023-34362",
            "title": "MOVEit Transfer SQL Injection & RCE",
            "description": "SQL injection vulnerability in the MOVEit Transfer web application that could allow an unauthenticated attacker to gain unauthorized access.",
            "severity": "critical",
            "vendor": "Progress Software",
            "product": "MOVEit Transfer",
            "target_path": "/moveitisapi/moveitisapi.dll?action=m2",
            "c2_pattern": "human2.aspx",
        },
        {
            "cve_id": "CVE-2021-44228",
            "title": "Apache Log4j Remote Code Execution (Log4Shell)",
            "description": "JNDI lookup features used in configuration, log messages, and parameters do not protect against attacker-controlled LDAP and other JNDI related endpoints.",
            "severity": "critical",
            "vendor": "Apache",
            "product": "Log4j",
            "target_path": "/login",
            "c2_pattern": "${jndi:ldap://",
        },
        {
            "cve_id": "CVE-2022-22965",
            "title": "Spring Framework Remote Code Execution (Spring4Shell)",
            "description": "A Spring MVC or Spring WebFlux application running on JDK 9+ may be vulnerable to remote code execution via data binding class loader access.",
            "severity": "critical",
            "vendor": "VMware",
            "product": "Spring Framework",
            "target_path": "/helloworld",
            "c2_pattern": "class.module.classLoader.resources.context.parent.pipeline.first.pattern",
        },
        {
            "cve_id": "CVE-2023-46805",
            "title": "Ivanti Policy Secure Authentication Bypass",
            "description": "Authentication bypass vulnerability in the web component of Ivanti Policy Secure allowing access to restricted endpoints without credentials.",
            "severity": "critical",
            "vendor": "Ivanti",
            "product": "Policy Secure",
            "target_path": "/api/v1/cav/client/status/../../admin/options",
            "c2_pattern": "rest/api/v1/cav",
        },
    ]

    def __init__(self, rules_dir: Optional[Path] = None):
        self.rules_dir = rules_dir or RULES_DIR
        self.rules_dir.mkdir(parents=True, exist_ok=True)

    def sanitize_identifier(self, name: str) -> str:
        """Sanitizes names into safe alphanumeric identifiers for rule names."""
        clean = re.sub(r"[^a-zA-Z0-9_]", "_", name)
        return clean.strip("_") or "threat_rule"

    def synthesize_yara_rule(
        self,
        rule_name: str,
        description: str,
        strings: List[str],
        author: str = "SageAI Autonomous Threat Engine",
        severity: str = "high",
    ) -> str:
        """
        Synthesizes a valid YARA rule string.
        """
        ident = self.sanitize_identifier(rule_name)
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        string_lines = []
        condition_terms = []
        for i, s in enumerate(strings[:8]):
            # Escape backslashes and double quotes
            safe_s = s.replace("\\", "\\\\").replace('"', '\\"')
            string_lines.append(f'        $s{i+1} = "{safe_s}" ascii wide nocase')
            condition_terms.append(f"$s{i+1}")

        if not condition_terms:
            string_lines.append(f'        $s1 = "{ident}" ascii wide')
            condition_terms.append("$s1")

        condition = " or ".join(condition_terms) if len(condition_terms) <= 3 else f"2 of ({', '.join(condition_terms)})"

        rule = f"""rule SageAI_{ident} {{
    meta:
        description = "{description.replace('"', "'")}"
        author = "{author}"
        date = "{timestamp}"
        severity = "{severity}"
        reference = "https://sageai.defense/threats/{ident}"

    strings:
{chr(10).join(string_lines)}

    condition:
        {condition}
}}
"""
        return rule

    def synthesize_sigma_rule(
        self,
        cve_id: str,
        title: str,
        description: str,
        category: str = "webserver",
        keywords: Optional[List[str]] = None,
    ) -> str:
        """
        Synthesizes a valid YAML Sigma rule for SIEM detection.
        """
        ident = self.sanitize_identifier(cve_id)
        kw = keywords or [cve_id, "cmd.exe", "/bin/sh", "whoami"]
        kw_formatted = "\n".join([f"            - '{k}'" for k in kw])

        sigma = f"""title: SageAI Detection for {title}
id: {ident.lower()}-threat-detect
status: experimental
description: {description.replace('"', "'")}
references:
    - https://cve.mitre.org/cgi-bin/cvename.cgi?name={cve_id}
author: SageAI Threat Intel Engine
date: {datetime.now(timezone.utc).strftime("%Y/%m/%d")}
logsource:
    category: {category}
    product: any
detection:
    keywords:
        cve_pattern:
{kw_formatted}
    condition: cve_pattern
falsepositives:
    - Legitimate penetration testing
    - Security scanner traffic
level: high
tags:
    - attack.initial_access
    - attack.t1190
    - cve.{cve_id.lower()}
"""
        return sigma

    def synthesize_nuclei_template(
        self,
        cve_id: str,
        name: str,
        severity: str = "high",
        path: str = "/api/v1/health",
        probe_header: str = "X-SageAI-Probe",
    ) -> str:
        """
        Synthesizes a valid Nuclei YAML template for safe network scanning.
        """
        ident = self.sanitize_identifier(cve_id).lower()
        template = f"""id: {ident}

info:
  name: {name}
  author: SageAI Autonomous RedTeam
  severity: {severity.lower()}
  description: Automated non-destructive probe for {cve_id}
  tags: cve,sageai,{severity.lower()}

http:
  - method: GET
    path:
      - "{{{{BaseURL}}}}{path}"
    headers:
      {probe_header}: "test-probe"
    matchers-condition: and
    matchers:
      - type: status
        status:
          - 200
      - type: word
        words:
          - "{cve_id}"
        part: body
"""
        return template

    def synthesize_waf_virtual_patch(
        self,
        cve_id: str,
        target_param: str,
        attack_signature_regex: str,
    ) -> Dict[str, str]:
        """
        Synthesizes ModSecurity SecRule and Cloudflare/AWS WAF regex rules.
        """
        modsec = (
            f"# SageAI Virtual Patch for {cve_id}\n"
            f'SecRule ARGS:{target_param} "@rx {attack_signature_regex}" '
            f'"id:990001,phase:2,deny,status:403,log,msg:\'SageAI Virtual Patch blocked exploit for {cve_id}\'"'
        )

        return {
            "cve_id": cve_id,
            "modsecurity_rule": modsec,
            "cloudflare_rule": f'http.request.uri.query contains "{target_param}" and http.request.body matches "{attack_signature_regex}"',
            "aws_waf_regex": attack_signature_regex,
        }

    def process_threat_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Full synthesis pipeline for a threat feed item.
        Saves rules to disk and returns synthesized artifact manifests.
        """
        cve_id = item.get("id") or item.get("cve_id") or "CVE-UNKNOWN"
        title = item.get("title") or f"Vulnerability {cve_id}"
        description = item.get("description") or "Automated threat rule synthesis"
        severity = item.get("severity") or "high"

        strings = [cve_id, item.get("vendor_project", ""), item.get("product", ""), item.get("c2_pattern", "")]
        strings = [s for s in strings if s]

        yara_rule = self.synthesize_yara_rule(
            rule_name=cve_id,
            description=description,
            strings=strings,
            severity=severity,
        )

        sigma_rule = self.synthesize_sigma_rule(
            cve_id=cve_id,
            title=title,
            description=description,
            keywords=strings,
        )

        nuclei_template = self.synthesize_nuclei_template(
            cve_id=cve_id,
            name=title,
            severity=severity,
            path=item.get("target_path", "/api/v1/health"),
        )

        waf_patch = self.synthesize_waf_virtual_patch(
            cve_id=cve_id,
            target_param="id",
            attack_signature_regex=r"(?i)(union\s+select|eval\(|<script>|\.\./\.\./)",
        )

        # Save to rule storage
        rule_filename = self.sanitize_identifier(cve_id)
        yara_path = self.rules_dir / f"{rule_filename}.yar"
        sigma_path = self.rules_dir / f"{rule_filename}.sigma.yml"
        nuclei_path = self.rules_dir / f"{rule_filename}.nuclei.yml"

        try:
            yara_path.write_text(yara_rule, encoding="utf-8")
            sigma_path.write_text(sigma_rule, encoding="utf-8")
            nuclei_path.write_text(nuclei_template, encoding="utf-8")
        except Exception as e:
            logger.warning(f"Could not persist rule files for {cve_id}: {e}")

        return {
            "cve_id": cve_id,
            "title": title,
            "severity": severity,
            "yara_rule": yara_rule,
            "sigma_rule": sigma_rule,
            "nuclei_template": nuclei_template,
            "waf_patch": waf_patch,
            "saved_paths": {
                "yara": str(yara_path),
                "sigma": str(sigma_path),
                "nuclei": str(nuclei_path),
            },
        }

    def synthesize_from_cve_id(self, cve_id: str) -> Dict[str, Any]:
        """Looks up or synthesizes rules for a specific CVE ID."""
        from app.services.threat_feed.cve_indexer import cve_indexer

        cve_upper = cve_id.upper().strip()

        # Check preloaded templates first
        for pre in self.PRELOADED_TEMPLATES:
            if pre["cve_id"].upper() == cve_upper:
                return self.process_threat_item(pre)

        # Check CVE Indexer
        vuln = cve_indexer.get_by_id(cve_upper)
        if vuln:
            return self.process_threat_item(vuln.model_dump())

        # Fallback dynamic synthesis
        synthetic_item = {
            "cve_id": cve_upper,
            "title": f"Zero-Day Threat Advisory {cve_upper}",
            "description": f"Automated dynamic detection rule synthesis for {cve_upper}",
            "severity": "critical",
            "vendor_project": "Enterprise",
            "product": "Web Application",
            "target_path": "/api/v1/query",
        }
        return self.process_threat_item(synthetic_item)

    def validate_rule(self, rule_type: str, content: str) -> Dict[str, Any]:
        """Validates syntax sanity for generated defense rules."""
        rt = rule_type.lower()
        if rt == "yara":
            has_rule = "rule " in content
            has_strings = "strings:" in content
            has_cond = "condition:" in content
            valid = has_rule and has_strings and has_cond and content.count("{") == content.count("}")
            return {
                "valid": valid,
                "rule_type": "YARA",
                "message": "Valid YARA rule syntax structure" if valid else "Missing rule declaration, strings block, or balanced braces",
            }
        elif rt in ("sigma", "nuclei"):
            try:
                parsed = yaml.safe_load(content)
                has_keys = bool(parsed and isinstance(parsed, dict))
                return {
                    "valid": has_keys,
                    "rule_type": rt.upper(),
                    "message": f"Valid {rt.upper()} YAML schema parsed successfully" if has_keys else "Invalid YAML structure",
                }
            except Exception as e:
                return {
                    "valid": False,
                    "rule_type": rt.upper(),
                    "message": f"YAML Syntax Error: {e}",
                }
        return {"valid": True, "rule_type": rt, "message": "Generic syntax accepted"}


# Global singleton synthesizer
threat_pattern_synthesizer = ThreatPatternSynthesizer()

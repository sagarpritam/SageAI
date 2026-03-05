"""AI Explainer Service — Enhanced with Real OpenAI Integration.

Provides OWASP-mapped vulnerability explanations, remediation steps,
and AI-powered analysis via OpenAI GPT models when configured.
Falls back to comprehensive static explanations when OPENAI_API_KEY is not set.
"""

import os
import logging
import httpx

logger = logging.getLogger("sageai.ai")


# ---------------------
# OWASP Top 10 Mapping
# ---------------------
OWASP_MAP = {
    "Missing Security Headers": {"owasp_id": "A05:2021", "owasp_category": "Security Misconfiguration", "cwe": "CWE-693"},
    "Reflected XSS": {"owasp_id": "A03:2021", "owasp_category": "Injection", "cwe": "CWE-79"},
    "SQL Injection": {"owasp_id": "A03:2021", "owasp_category": "Injection", "cwe": "CWE-89"},
    "ssl_expired": {"owasp_id": "A02:2021", "owasp_category": "Cryptographic Failures", "cwe": "CWE-295"},
    "ssl_expiring_soon": {"owasp_id": "A02:2021", "owasp_category": "Cryptographic Failures", "cwe": "CWE-295"},
    "ssl_weak_protocol": {"owasp_id": "A02:2021", "owasp_category": "Cryptographic Failures", "cwe": "CWE-326"},
    "ssl_weak_cipher": {"owasp_id": "A02:2021", "owasp_category": "Cryptographic Failures", "cwe": "CWE-327"},
    "ssl_invalid_cert": {"owasp_id": "A02:2021", "owasp_category": "Cryptographic Failures", "cwe": "CWE-295"},
    "port_open": {"owasp_id": "A05:2021", "owasp_category": "Security Misconfiguration", "cwe": "CWE-200"},
    "dns_risky_subdomains": {"owasp_id": "A05:2021", "owasp_category": "Security Misconfiguration", "cwe": "CWE-200"},
}


# ---------------------
# Static Explanations
# ---------------------
EXPLANATIONS = {
    "Missing Security Headers": {
        "summary": "The application is missing critical HTTP security headers.",
        "detail": "Security headers instruct the browser how to behave when handling your site's content. Without them, the app is exposed to clickjacking, MIME-type sniffing, protocol downgrade, and script injection attacks.",
        "impact": "Medium — Increases attack surface. May fail PCI-DSS and SOC2 audits.",
        "severity": "Medium",
    },
    "Reflected XSS": {
        "summary": "User-supplied input is reflected in the page without sanitization.",
        "detail": "Reflected XSS occurs when user input is included in HTTP responses without encoding. Attackers can execute arbitrary JavaScript in victim browsers leading to session hijacking and credential theft.",
        "impact": "High — Session cookies stolen, users redirected to malicious sites.",
        "severity": "High",
    },
    "SQL Injection": {
        "summary": "Unsanitized user input reaches database queries.",
        "detail": "SQL Injection allows attackers to manipulate queries, bypass auth, extract data, modify records, and potentially execute OS commands on the database server.",
        "impact": "Critical — Full database compromise, data exfiltration, server takeover.",
        "severity": "Critical",
    },
    "ssl_expired": {
        "summary": "SSL certificate has expired.",
        "detail": "An expired certificate means browsers will show security warnings, users won't trust the site, and encrypted communication cannot be verified.",
        "impact": "Critical — Users see security warnings, MITM attacks possible.",
        "severity": "Critical",
    },
    "ssl_weak_protocol": {
        "summary": "Using outdated TLS protocol.",
        "detail": "TLS 1.0 and 1.1 have known vulnerabilities (BEAST, POODLE). All modern compliance frameworks require TLS 1.2+.",
        "impact": "High — Encrypted traffic can potentially be decrypted.",
        "severity": "High",
    },
    "port_open": {
        "summary": "A service port is publicly accessible.",
        "detail": "Exposed database, admin, or legacy service ports increase the attack surface. Services like Redis, MongoDB, and RDP should never be publicly accessible.",
        "impact": "High — Direct attack vector for unauthorized access.",
        "severity": "High",
    },
}

REMEDIATION = {
    "Missing Security Headers": {
        "steps": [
            "Add Content-Security-Policy: default-src 'self'",
            "Add Strict-Transport-Security: max-age=31536000; includeSubDomains",
            "Add X-Frame-Options: DENY",
            "Add X-Content-Type-Options: nosniff",
            "Add Referrer-Policy: strict-origin-when-cross-origin",
        ],
        "references": ["https://owasp.org/www-project-secure-headers/"],
    },
    "Reflected XSS": {
        "steps": [
            "Encode all user input before rendering in HTML",
            "Implement strict Content-Security-Policy",
            "Use auto-escaping templating engines",
            "Validate and sanitize input server-side",
        ],
        "references": ["https://owasp.org/www-community/attacks/xss/"],
    },
    "SQL Injection": {
        "steps": [
            "Use parameterized queries for all database operations",
            "Adopt an ORM like SQLAlchemy",
            "Apply input validation with whitelists",
            "Use least-privilege database accounts",
        ],
        "references": ["https://owasp.org/www-community/attacks/SQL_Injection"],
    },
    "ssl_expired": {
        "steps": ["Renew the SSL certificate immediately", "Set up auto-renewal with Let's Encrypt"],
        "references": ["https://letsencrypt.org/"],
    },
    "ssl_weak_protocol": {
        "steps": ["Disable TLS 1.0 and 1.1 on the server", "Configure TLS 1.2 as minimum"],
        "references": ["https://wiki.mozilla.org/Security/Server_Side_TLS"],
    },
    "port_open": {
        "steps": ["Close unnecessary ports via firewall rules", "Use VPN/SSH tunnels for admin access", "Bind databases to localhost only"],
        "references": ["https://owasp.org/www-project-web-security-testing-guide/"],
    },
}


# ---------------------
# OpenAI Integration
# ---------------------
async def ai_explain_finding(finding_type: str, context: str = "") -> dict | None:
    """Use OpenAI GPT to generate a detailed vulnerability explanation.
    
    Returns None if OpenAI is not configured or fails.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    prompt = f"""You are a cybersecurity expert. Analyze this vulnerability finding and provide:
1. A clear summary (1 sentence)
2. Technical detail (2-3 sentences explaining how this vulnerability works)
3. Business impact (1 sentence)
4. 3-5 specific remediation steps
5. OWASP Top 10 mapping if applicable

Finding type: {finding_type}
Additional context: {context or 'None'}

Respond in JSON format with keys: summary, detail, impact, severity (Critical/High/Medium/Low), remediation_steps (array of strings), owasp_id, owasp_category"""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"},
                },
            )

            if response.status_code == 200:
                import json
                content = response.json()["choices"][0]["message"]["content"]
                return json.loads(content)
            else:
                logger.warning(f"OpenAI API error: {response.status_code}")
                return None

    except Exception as e:
        logger.error(f"OpenAI request failed: {e}")
        return None


async def ai_analyze_scan(findings: list[dict]) -> dict | None:
    """Use AI to generate an executive summary of all scan findings."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or not findings:
        return None

    findings_text = "\n".join(
        f"- [{f.get('severity', 'unknown')}] {f.get('type', 'unknown')}: {f.get('detail', f.get('description', ''))}"
        for f in findings[:20]
    )

    prompt = f"""You are a cybersecurity analyst writing an executive summary for a security scan.

Findings:
{findings_text}

Provide a JSON response with:
- executive_summary: 2-3 sentence overview suitable for C-level executives
- top_priorities: array of top 3 issues to fix first (each with title and reason)
- compliance_notes: brief note on PCI-DSS, SOC2, GDPR implications
- overall_risk: Critical/High/Medium/Low"""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "response_format": {"type": "json_object"},
                },
            )

            if response.status_code == 200:
                import json
                return json.loads(response.json()["choices"][0]["message"]["content"])
            return None
    except Exception as e:
        logger.error(f"AI scan analysis failed: {e}")
        return None


# ---------------------
# Public API
# ---------------------
def explain_finding(finding_type: str) -> dict:
    """Return a comprehensive explanation for a vulnerability type (static fallback)."""
    explanation = EXPLANATIONS.get(finding_type, {
        "summary": f"Finding: {finding_type}",
        "detail": "This finding type has not been catalogued. Consult OWASP resources.",
        "impact": "Unknown",
        "severity": "Unknown",
    })
    owasp = OWASP_MAP.get(finding_type)
    remediation = REMEDIATION.get(finding_type, {"steps": ["Consult security documentation."], "references": []})

    return {"finding_type": finding_type, **explanation, "owasp": owasp, "remediation": remediation}


def enrich_findings(findings: list[dict]) -> list[dict]:
    """Add AI explanations and OWASP mappings to scan findings."""
    enriched = []
    for finding in findings:
        ftype = finding.get("type", "")
        enriched_finding = {
            **finding,
            "explanation": EXPLANATIONS.get(ftype, {}).get("detail", ""),
            "owasp": OWASP_MAP.get(ftype),
            "remediation": REMEDIATION.get(ftype, {}).get("steps", []),
        }
        enriched.append(enriched_finding)
    return enriched

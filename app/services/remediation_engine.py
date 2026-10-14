"""SageAI Defensive Security Shield — Remediation Engine.

Generates actionable, prioritized fix guidance for every finding type with:
- Language-specific code snippets (Python, Node.js, Nginx, Apache)
- Priority ranking by impact × effort matrix
- Time-to-fix estimates
- Auto-fix config templates
"""

import logging
from typing import Optional  # noqa: F401 — used in type hints for callers

logger = logging.getLogger("sageai.remediation")


# ──────────────────────────────────────────────
# Effort levels (minutes)
# ──────────────────────────────────────────────
EFFORT_QUICK = 15  # < 15 min
EFFORT_MODERATE = 60  # < 1 hour
EFFORT_SIGNIFICANT = 240  # < 4 hours
EFFORT_MAJOR = 480  # < 1 day


# ──────────────────────────────────────────────
# Impact multipliers for priority scoring
# ──────────────────────────────────────────────
SEVERITY_IMPACT = {
    "critical": 10,
    "high": 7,
    "medium": 4,
    "low": 2,
    "info": 0,
}


# ──────────────────────────────────────────────
# Comprehensive remediation database
# ──────────────────────────────────────────────
REMEDIATION_DB: dict[str, dict] = {
    "Missing Security Headers": {
        "title": "Add Security Headers",
        "effort_minutes": EFFORT_QUICK,
        "effort_label": "Quick Fix (~15 min)",
        "impact": "Prevents clickjacking, MIME sniffing, and protocol downgrade attacks",
        "auto_fixable": True,
        "steps": [
            "Add Content-Security-Policy header",
            "Add Strict-Transport-Security header",
            "Add X-Frame-Options: DENY",
            "Add X-Content-Type-Options: nosniff",
            "Add Referrer-Policy: strict-origin-when-cross-origin",
        ],
        "code_snippets": {
            "nginx": """# /etc/nginx/conf.d/security-headers.conf
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;""",
            "python_fastapi": """from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app = FastAPI()
app.add_middleware(SecurityHeadersMiddleware)""",
            "nodejs_express": """const helmet = require("helmet");

// Add this near the top of your Express app
app.use(helmet());

// Or configure individually:
app.use(helmet.contentSecurityPolicy({
  directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"] }
}));
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
app.use(helmet.frameguard({ action: "deny" }));""",
            "apache": '''# .htaccess or httpd.conf
Header always set Content-Security-Policy "default-src 'self'"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"''',
        },
        "references": [
            "https://owasp.org/www-project-secure-headers/",
            "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers",
        ],
    },
    "Reflected XSS": {
        "title": "Fix Cross-Site Scripting (XSS)",
        "effort_minutes": EFFORT_MODERATE,
        "effort_label": "Moderate (~1 hour)",
        "impact": "Prevents session hijacking, credential theft, and malware injection",
        "auto_fixable": False,
        "steps": [
            "HTML-encode all user input before rendering",
            "Implement strict Content-Security-Policy",
            "Use auto-escaping template engines (Jinja2, React JSX)",
            "Validate and sanitize input server-side",
            "Use HTTPOnly and Secure flags on session cookies",
        ],
        "code_snippets": {
            "python_fastapi": """from markupsafe import escape

# Always escape user input before rendering
@app.get("/search")
async def search(q: str = ""):
    safe_query = escape(q)  # HTML-encodes special characters
    return {"results": f"Results for: {safe_query}"}""",
            "nodejs_express": """const xss = require("xss");

// Sanitize user input
app.get("/search", (req, res) => {
  const safeQuery = xss(req.query.q || "");
  res.json({ results: `Results for: ${safeQuery}` });
});""",
        },
        "references": [
            "https://owasp.org/www-community/attacks/xss/",
            "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
        ],
    },
    "SQL Injection": {
        "title": "Eliminate SQL Injection",
        "effort_minutes": EFFORT_SIGNIFICANT,
        "effort_label": "Significant (~4 hours)",
        "impact": "Prevents full database compromise, data exfiltration, and server takeover",
        "auto_fixable": False,
        "steps": [
            "Replace all raw SQL with parameterized queries",
            "Adopt an ORM (SQLAlchemy, Prisma, Sequelize)",
            "Apply input validation with strict whitelists",
            "Use least-privilege database accounts",
            "Enable query logging to detect exploitation attempts",
        ],
        "code_snippets": {
            "python_fastapi": """# BAD — vulnerable to SQL injection
query = f"SELECT * FROM users WHERE id = '{user_input}'"

# GOOD — parameterized query with SQLAlchemy
from sqlalchemy import text
result = await session.execute(
    text("SELECT * FROM users WHERE id = :user_id"),
    {"user_id": user_input}
)""",
            "nodejs_express": """// BAD — vulnerable
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// GOOD — parameterized query
const result = await pool.query(
  "SELECT * FROM users WHERE id = $1",
  [userId]
);""",
        },
        "references": [
            "https://owasp.org/www-community/attacks/SQL_Injection",
            "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
        ],
    },
    "ssl_expired": {
        "title": "Renew Expired SSL Certificate",
        "effort_minutes": EFFORT_QUICK,
        "effort_label": "Quick Fix (~15 min)",
        "impact": "Restores encrypted communications and user trust",
        "auto_fixable": True,
        "steps": [
            "Renew the SSL certificate immediately",
            "Set up auto-renewal with Let's Encrypt / certbot",
            "Configure certificate monitoring alerts",
        ],
        "code_snippets": {
            "bash": """# Install certbot and auto-renew
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
# Auto-renewal is set up automatically via systemd timer
sudo certbot renew --dry-run""",
        },
        "references": ["https://letsencrypt.org/getting-started/"],
    },
    "ssl_expiring_soon": {
        "title": "Renew SSL Certificate Before Expiry",
        "effort_minutes": EFFORT_QUICK,
        "effort_label": "Quick Fix (~15 min)",
        "impact": "Prevents service disruption from expired certificate",
        "auto_fixable": True,
        "steps": [
            "Schedule certificate renewal before expiry date",
            "Verify certbot auto-renewal is active",
            "Add monitoring for certificate expiry (e.g., UptimeRobot, Datadog)",
        ],
        "code_snippets": {
            "bash": """# Check current cert expiry
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -enddate

# Force renewal
sudo certbot renew --force-renewal""",
        },
        "references": ["https://letsencrypt.org/docs/"],
    },
    "ssl_weak_protocol": {
        "title": "Disable Weak TLS Protocols",
        "effort_minutes": EFFORT_QUICK,
        "effort_label": "Quick Fix (~15 min)",
        "impact": "Prevents BEAST, POODLE, and other protocol downgrade attacks",
        "auto_fixable": True,
        "steps": [
            "Disable TLS 1.0 and TLS 1.1",
            "Set TLS 1.2 as minimum protocol version",
            "Enable TLS 1.3 for modern clients",
        ],
        "code_snippets": {
            "nginx": """# /etc/nginx/nginx.conf
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384;""",
            "apache": """# httpd-ssl.conf
SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256""",
        },
        "references": ["https://wiki.mozilla.org/Security/Server_Side_TLS"],
    },
    "ssl_weak_cipher": {
        "title": "Remove Weak Cipher Suites",
        "effort_minutes": EFFORT_QUICK,
        "effort_label": "Quick Fix (~15 min)",
        "impact": "Prevents cryptographic attacks on encrypted traffic",
        "auto_fixable": True,
        "steps": [
            "Remove RC4, DES, 3DES, and export cipher suites",
            "Use Mozilla SSL Configuration Generator for your server",
            "Test with SSL Labs after changes",
        ],
        "code_snippets": {
            "nginx": """# Use Mozilla's modern configuration
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;""",
        },
        "references": ["https://ssl-config.mozilla.org/"],
    },
    "ssl_invalid_cert": {
        "title": "Fix Invalid SSL Certificate",
        "effort_minutes": EFFORT_MODERATE,
        "effort_label": "Moderate (~1 hour)",
        "impact": "Prevents man-in-the-middle attacks and browser warnings",
        "auto_fixable": False,
        "steps": [
            "Verify the certificate matches the domain name",
            "Check the full certificate chain is installed",
            "Replace self-signed certs with CA-signed certificates",
        ],
        "code_snippets": {
            "bash": '''# Verify certificate chain
openssl s_client -connect yourdomain.com:443 -showcerts

# Test with curl
curl -vI https://yourdomain.com 2>&1 | grep -i "ssl\\|cert"''',
        },
        "references": ["https://www.ssllabs.com/ssltest/"],
    },
    "port_open": {
        "title": "Close Unnecessary Open Ports",
        "effort_minutes": EFFORT_MODERATE,
        "effort_label": "Moderate (~1 hour)",
        "impact": "Reduces attack surface by removing direct access to internal services",
        "auto_fixable": False,
        "steps": [
            "Audit all open ports and identify services",
            "Close unnecessary ports via firewall (iptables/ufw/security groups)",
            "Bind databases and admin services to localhost only",
            "Use VPN or SSH tunnels for remote admin access",
        ],
        "code_snippets": {
            "bash": """# UFW: deny all incoming, allow only needed ports
sudo ufw default deny incoming
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH
sudo ufw enable

# AWS Security Group (via CLI)
aws ec2 revoke-security-group-ingress --group-id sg-xxx --protocol tcp --port 3306 --cidr 0.0.0.0/0""",
        },
        "references": ["https://owasp.org/www-project-web-security-testing-guide/"],
    },
    "dns_risky_subdomains": {
        "title": "Secure Risky DNS Subdomains",
        "effort_minutes": EFFORT_MODERATE,
        "effort_label": "Moderate (~1 hour)",
        "impact": "Prevents subdomain takeover and information disclosure",
        "auto_fixable": False,
        "steps": [
            "Remove DNS records pointing to decommissioned services",
            "Verify all subdomains resolve to controlled infrastructure",
            "Implement subdomain monitoring for unauthorized changes",
        ],
        "code_snippets": {},
        "references": ["https://owasp.org/www-project-web-security-testing-guide/"],
    },
    "virustotal_malicious": {
        "title": "Investigate Malicious URL Detection",
        "effort_minutes": EFFORT_SIGNIFICANT,
        "effort_label": "Significant (~4 hours)",
        "impact": "Domain may be blocklisted, affecting email delivery and user trust",
        "auto_fixable": False,
        "steps": [
            "Check VirusTotal report for detection engine details",
            "Scan server for malware or injected content",
            "Review DNS records for unauthorized modifications",
            "Submit false-positive appeals if the detection is incorrect",
            "Implement Content-Security-Policy to prevent content injection",
        ],
        "code_snippets": {},
        "references": ["https://www.virustotal.com/"],
    },
    "shodan_vulns": {
        "title": "Address Shodan-Detected Vulnerabilities",
        "effort_minutes": EFFORT_SIGNIFICANT,
        "effort_label": "Significant (~4 hours)",
        "impact": "Publicly visible vulnerabilities can be exploited by automated scanners",
        "auto_fixable": False,
        "steps": [
            "Review each CVE listed and apply patches",
            "Update exposed services to latest versions",
            "Restrict access to management interfaces",
            "Consider using a WAF to shield vulnerable endpoints",
        ],
        "code_snippets": {},
        "references": ["https://www.shodan.io/"],
    },
    "nvd_cve": {
        "title": "Patch Known CVE Vulnerabilities",
        "effort_minutes": EFFORT_MAJOR,
        "effort_label": "Major (~1 day)",
        "impact": "Known CVEs have public exploits — highest risk of automated attack",
        "auto_fixable": False,
        "steps": [
            "Identify affected software version from CVE details",
            "Apply vendor-provided security patches",
            "If no patch exists, apply recommended mitigations",
            "Use a dependency scanner (Dependabot, Snyk) for ongoing monitoring",
        ],
        "code_snippets": {
            "bash": """# Check installed package versions
dpkg -l | grep <package_name>

# Update specific package
sudo apt update && sudo apt install --only-upgrade <package_name>

# For Python dependencies
pip install --upgrade <package_name>
pip audit  # Check for known vulnerabilities""",
        },
        "references": ["https://nvd.nist.gov/"],
    },
    "Identity Breach Intelligence": {
        "title": "Respond to Data Breach Exposure",
        "effort_minutes": EFFORT_SIGNIFICANT,
        "effort_label": "Significant (~4 hours)",
        "impact": "Compromised credentials enable account takeover attacks",
        "auto_fixable": False,
        "steps": [
            "Force password reset for potentially affected accounts",
            "Enable multi-factor authentication (MFA) for all users",
            "Monitor for unauthorized access using audit logs",
            "Notify affected users per GDPR/breach notification requirements",
            "Review and rotate any API keys or service credentials",
        ],
        "code_snippets": {},
        "references": ["https://haveibeenpwned.com/"],
    },
    "observatory_grade": {
        "title": "Improve Mozilla Observatory Score",
        "effort_minutes": EFFORT_MODERATE,
        "effort_label": "Moderate (~1 hour)",
        "impact": "Low observatory grades indicate multiple security misconfigurations",
        "auto_fixable": True,
        "steps": [
            "Review the Observatory report for failing tests",
            "Implement all recommended security headers",
            "Enable HSTS preloading",
            "Configure Content-Security-Policy",
        ],
        "code_snippets": {},
        "references": ["https://observatory.mozilla.org/"],
    },
    "crtsh_sensitive_subdomains": {
        "title": "Review Exposed Certificate Transparency Subdomains",
        "effort_minutes": EFFORT_QUICK,
        "effort_label": "Quick Fix (~15 min)",
        "impact": "Exposed subdomains reveal internal infrastructure to attackers",
        "auto_fixable": False,
        "steps": [
            "Audit discovered subdomains for sensitive services",
            "Restrict access to internal/staging subdomains",
            "Use wildcard certificates carefully — they expose all subdomain names",
        ],
        "code_snippets": {},
        "references": ["https://crt.sh/"],
    },
}


def get_remediation(finding_type: str) -> dict:
    """Get remediation guidance for a specific finding type."""
    entry = REMEDIATION_DB.get(finding_type)
    if not entry:
        return {
            "title": f"Remediate: {finding_type}",
            "effort_minutes": EFFORT_MODERATE,
            "effort_label": "Varies",
            "impact": "Consult security documentation for this finding type.",
            "auto_fixable": False,
            "steps": ["Review OWASP documentation for this vulnerability class."],
            "code_snippets": {},
            "references": ["https://owasp.org/"],
        }
    return entry


def prioritize_remediations(findings: list[dict]) -> list[dict]:
    """Generate a prioritized remediation plan from scan findings.

    Priority = Impact × (1 / Effort), so high-impact quick-fix items come first.

    Returns:
        List of remediation items sorted by priority (highest first).
    """
    seen_types: set[str] = set()
    items = []

    for finding in findings:
        ftype = finding.get("type", "")
        if ftype in seen_types:
            continue
        seen_types.add(ftype)

        severity = finding.get("severity", "info").lower()
        impact = SEVERITY_IMPACT.get(severity, 0)
        remediation = get_remediation(ftype)
        effort = remediation.get("effort_minutes", EFFORT_MODERATE)

        # Priority score: impact / normalized_effort (higher = fix first)
        priority_score = round((impact * 100) / max(effort, 1), 2)

        items.append(
            {
                "finding_type": ftype,
                "severity": finding.get("severity", "Info"),
                "priority_score": priority_score,
                **remediation,
            }
        )

    # Sort by priority descending
    items.sort(key=lambda x: x["priority_score"], reverse=True)

    # Add rank
    for i, item in enumerate(items, 1):
        item["rank"] = i

    return items


def get_quick_wins(findings: list[dict], max_items: int = 5) -> list[dict]:
    """Return the top quick-win remediations (high impact, low effort)."""
    all_items = prioritize_remediations(findings)
    return [
        item
        for item in all_items
        if item.get("auto_fixable") or item.get("effort_minutes", 999) <= EFFORT_QUICK
    ][:max_items]

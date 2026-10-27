# Security Policy — SageAI

SageAI is committed to building secure, autonomous threat intelligence and offensive/defensive cybersecurity tools. We take software security, secret protection, and vulnerability disclosures seriously.

---

## 1. Supported Versions

Security updates and patches are actively applied to the following versions:

| Version | Supported | Security Policy |
| :--- | :--- | :--- |
| **2.4.x / 2.0.0 (Current)** | :white_check_mark: | Active security patches, automated DevSecOps CI matrix |
| **< 2.0.0** | :x: | Deprecated. Please upgrade to latest `main`. |

---

## 2. Reporting a Vulnerability

If you discover a potential security vulnerability within SageAI, **please do not disclose it publicly** via GitHub issues or discussions.

1. **Email Reports**: Send vulnerability details to `security@sageai.internal` or `sagarpritam@users.noreply.github.com`.
2. **Encrypted Submissions**: For sensitive proof-of-concept exploits, attach a PGP-encrypted report or request our public key via email.
3. **Information to Include**:
   - Description of the vulnerability and attack vector.
   - Exact steps or minimal script to reproduce the issue.
   - Affected endpoints, parameters, or components.
   - Potential impact (e.g., Privilege Escalation, SSRF, Information Leak).
4. **Response Timelines**:
   - **Initial Acknowledgement**: Within 24–48 hours.
   - **Triage & Severity Assessment**: Within 72 hours.
   - **Remediation & Patch Deployment**: Critical issues are prioritized for release within 7 days.

---

## 3. Security Baseline & Architecture Controls

SageAI enforces rigorous defense-in-depth across the entire full-stack architecture:

### Authentication & Authorization
- **Cryptographic Password Storage**: PBKDF2-SHA256 with 600,000 iterations (OWASP Password Storage benchmark). Automatic hash re-upgrades on login.
- **Role-Based Access Control (RBAC)**: Strict role separation (`admin`, `analyst`, `user`). High-impact operations (adversarial red-teaming, asset deletion, integration credentials, and automated patch approvals) require verified `admin` role authorization.
- **Tenant Isolation**: Multi-tenant database querying strictly filters all data by `organization_id` derived from verified JWT tokens.

### Data Protection & Secrets Handling
- **Zero Raw Secrets in Source**: No credentials, private keys, or API tokens committed. Git history audited across all branches.
- **At-Rest Token Encryption**: Third-party integration tokens (GitHub, VirusTotal, Shodan, Censys) are encrypted using Fernet AES-128-CBC before database persistence.
- **Dynamic Key Auto-Rotation**: Default or placeholder development keys are auto-rotated to ephemeral high-entropy cryptographic strings when deployed in production mode.

### API & Endpoint Defense
- **Global & Route-Level Rate Limiting**: SlowAPI token-bucket rate limiters guard against brute-force and DoS attacks across authentication (5–10/min), AI reasoning, and OSINT sweeping endpoints.
- **SSRF Prevention**: All external scanner requests and webhook triggers validate against RFC1918 private IP ranges, loopback addresses (`127.0.0.0/8`), and cloud metadata IP (`169.254.169.254`).
- **Production Information Shielding**: OpenAPI / Swagger documentation (`/docs`, `/redoc`, `/openapi.json`) is disabled in production environments (`ENV=production`).

### Frontend & XSS Protections
- **Markdown & HTML Sanitization**: User-facing markdown formatting HTML-escapes raw strings prior to tag rendering to prevent DOM-based XSS.
- **Strict Content-Security-Policy (CSP)**: Injected via Next.js proxy middleware alongside `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `HSTS`.

---

## 4. Automated DevSecOps Continuous Security Loop

All commits and pull requests undergo automated parallel scanning in GitHub Actions:
- **SAST**: Bandit security analysis with zero-tolerance high/critical thresholds.
- **Secrets Audit**: TruffleHog OSS full-history scanning & SageAI SecretScanner.
- **SCA**: Automated multi-language dependency auditing with `pip-audit` (Python) and `npm audit` (Node.js).
- **Closed-Loop Auto-Remediation**: Failing policy checks automatically notify SecOps channels and trigger SagePatch automated remediation pull requests.

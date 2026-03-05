# 🛡️ SageAI — AI-Powered Security Scanner

> Enterprise-grade web security scanning with real-time AI analysis, OSINT enrichment, and comprehensive reporting.

## ✨ Features

### 🔍 11-Point Deep Scanning (2 Phases)

**Phase 1 — Core Scans**
| Scanner | What it checks |
|---------|---------------|
| **Security Headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| **XSS Detection** | Reflected cross-site scripting via payload injection |
| **SQL Injection** | Database error disclosure from SQL payloads |
| **SSL/TLS** | Certificate expiry, protocol version, cipher strength |
| **Port Scanner** | 19 common ports — flags risky ones (Redis, RDP, MongoDB) |
| **DNS Enumeration** | Resolution, reverse DNS, subdomain discovery |

**Phase 2 — OSINT Enrichment**
| Source | API Key? | What it adds |
|--------|----------|-------------|
| **Shodan InternetDB** | ❌ Free | Known vulns, open ports, detected software (CPEs) |
| **CRT.sh** | ❌ Free | Certificate transparency — reveals hidden subdomains |
| **Mozilla Observatory** | ❌ Free | Industry-standard HTTP security grade (A+ to F) |
| **VirusTotal** | 🟡 Free tier | URL reputation from 70+ security vendors |
| **NVD/NIST** | ❌ Free | Real CVE IDs + CVSS scores for server software |

### 🤖 AI-Powered Analysis
- **OpenAI GPT Integration** — Real-time vulnerability explanations via GPT-4o-mini
- **Executive Summaries** — C-level scan reports with compliance notes
- **OWASP Top 10 Mapping** — Every finding mapped to OWASP + CWE IDs
- **Static Fallback** — Works without API key using built-in knowledge base

### 💼 Enterprise Features
- **Multi-tenant SaaS** — Organizations with RBAC (admin/viewer)
- **Stripe Billing** — Checkout, webhook, customer portal
- **API Keys** — Programmatic access with `sageai_` prefix
- **Webhooks** — HMAC-signed event notifications
- **Scheduled Scans** — Daily/weekly/monthly recurring scans
- **Email Notifications** — Scan results, team invites, password resets
- **MFA** — TOTP (Google Authenticator) with backup codes
- **Password Reset** — Secure token-based via email

### 🔗 Integrations
- **Slack** — Rich webhook alerts with color-coded risk levels
- **Jira** — Auto-creates bug tickets for critical findings
- **Sentry** — Error tracking and performance monitoring

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend
```bash
cd AegisAI
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file:
```env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite+aiosqlite:///./sageai.db

# AI (optional — enables GPT analysis)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# OSINT (optional — enhances scanning)
VIRUSTOTAL_API_KEY=...

# Billing (optional)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=app-password
FRONTEND_URL=http://localhost:5173

# Error Tracking (optional)
SENTRY_DSN=https://...@sentry.io/...

# Integrations (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
JIRA_URL=https://yoursite.atlassian.net
JIRA_EMAIL=you@company.com
JIRA_API_TOKEN=...
JIRA_PROJECT_KEY=SEC
```

---

## 📡 API Endpoints (31 total)

### Auth & MFA
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user + create org |
| POST | `/auth/login` | Login → JWT token |
| POST | `/auth/forgot-password` | Send reset email |
| POST | `/auth/reset-password` | Reset with token |
| POST | `/auth/mfa/setup` | Generate TOTP + QR code |
| POST | `/auth/mfa/verify` | Activate MFA |
| POST | `/auth/mfa/disable` | Disable MFA |

### Scanning (11 scanners)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/scan` | Run full 11-point security scan |
| GET | `/scan/{id}` | Get scan results |
| GET | `/scans` | List all org scans |

### Reports & AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/{id}` | JSON report |
| GET | `/reports/{id}/pdf` | Download PDF report |
| GET | `/explain/{type}` | AI vulnerability explanation |

### Organization
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/org/plan` | Current plan info |
| GET | `/org/plans` | Available plans |
| GET | `/org/users` | Team members |
| PATCH | `/org/users/{id}/role` | Change role |
| GET | `/org/stats` | Dashboard stats |

### API Keys, Webhooks, Billing, Schedules
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST/GET/DELETE | `/api-keys` | API keys |
| POST/GET/DELETE | `/webhooks` | Webhooks |
| POST | `/billing/checkout` | Stripe checkout |
| POST | `/billing/webhook` | Stripe webhook |
| GET | `/billing/portal` | Customer portal |
| POST/GET/DELETE | `/schedules` | Scheduled scans |

---

## 🏗️ Architecture

```
app/
├── core/             # Config, database, security (JWT)
├── middleware/        # Audit logging, security headers
├── models/           # 7 SQLAlchemy tables
├── routers/          # 11 route modules, 31 endpoints
├── schemas/          # Pydantic models
├── services/
│   ├── scanner_service.py    # Orchestrates 11 scans
│   ├── ssl_scanner.py        # TLS/SSL checks
│   ├── port_scanner.py       # Port enumeration
│   ├── dns_scanner.py        # DNS analysis
│   ├── nvd_client.py         # NIST CVE lookup
│   ├── shodan_client.py      # Shodan InternetDB
│   ├── virustotal_client.py  # URL reputation
│   ├── crtsh_client.py       # Cert transparency
│   ├── observatory_client.py # Mozilla Observatory
│   ├── ai_explainer.py       # OpenAI + static OWASP
│   ├── risk_engine.py        # OSINT-aware scoring
│   ├── email_service.py      # SMTP notifications
│   ├── mfa_service.py        # TOTP/QR codes
│   └── integrations.py       # Slack + Jira
frontend/             # React + Vite
tests/                # pytest async suite
.github/workflows/    # CI/CD pipeline
```

## 🧪 Testing
```bash
pytest tests/ -v
```

## 📄 License
MIT

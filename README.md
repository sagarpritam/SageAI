# 🛡️ SageAI — AI-Powered Enterprise Security & OSINT Platform

> **SageAI** is a YC-grade AI cybersecurity platform built for Attack Surface Management, automated penetration testing, Bug Bounty, and **Advanced OSINT Intelligence** — powered by FastAPI, React, and a Multi-Agent AI architecture with 9 integrated intelligence modules.

[![Tests](https://img.shields.io/badge/tests-45%20passing-brightgreen)](tests/)
[![Audit](https://github.com/sagarpritam/SageAI/actions/workflows/nightly-audit.yml/badge.svg)](https://github.com/sagarpritam/SageAI/actions/workflows/nightly-audit.yml)
[![Deploy](https://github.com/sagarpritam/SageAI/actions/workflows/deploy.yml/badge.svg)](https://github.com/sagarpritam/SageAI/actions/workflows/deploy.yml)
![Version](https://img.shields.io/badge/version-latest-blueviolet)
![Stack](https://img.shields.io/badge/stack-FastAPI%20%7C%20React%20%7C%20SQLAlchemy-informational)
[![Modules](https://img.shields.io/badge/intelligence-9%20OSINT%20modules-ff6b6b)](#-intelligence-hub--9-osint-modules)

---

## 🔥 Core Capabilities

| Feature | Description |
| --- | --- |
| ⚡ **Intelligence Hub** | 9 advanced OSINT modules — Shodan, Maltego, Babel X, SpiderFoot, Social Links, Intel X, Recon-ng, Censys, OSINT Industries |
| 🕸️ **Maltego Link Analysis** | Canvas-rendered entity relationship graph with nodes, edges, and radial layout |
| 🌑 **Dark Web Monitoring** | Tor search (Ahmia.fi) + paste site monitoring + Google dork suggestions |
| 👤 **Identity Resolution** | Sherlock-style username enumeration across 11+ platforms |
| 📡 **Certificate Transparency** | crt.sh + TLS inspection for certificate monitoring |
| 🗄️ **Breach Intelligence** | HaveIBeenPwned + Wayback Machine + IntelX archive search |
| 🔓 **Zero API Keys Required** | All 9 modules work immediately using free OSINT sources |
| ⬆️ **Premium Upgrades** | Drop in API keys for Shodan Pro, Censys, IntelX, Babel X and auto-upgrade |

---

## ⚡ Feature Matrix

| Category | Capabilities |
| --- | --- |
| **Scanning** | 11-scanner pipeline: Security Headers, XSS, SQLi, SSL/TLS, Port Scan, DNS + OSINT (Shodan, CRT.sh, Mozilla Observatory, VirusTotal, NVD CVE) |
| **Intelligence Hub** | 9 OSINT modules: Shodan, Maltego, Babel X, SpiderFoot, Social Links, Intel X, Recon-ng, Censys, OSINT Industries |
| **Asset Discovery** | Subdomain enum (crt.sh), DNS resolution, Shodan port data, HTTP probing, risk scoring per asset |
| **AI Analysis** | GPT-4o-mini with RAG knowledge base + live scan context injection + circuit breaker |
| **Multi-Agent** | ReconAgent → ScannerAgent → ExploitAgent → ReportAgent pipeline |
| **Risk Engine** | OSINT-aware CVSS-weighted risk scoring with attack surface correlation |
| **Multi-Tenant** | Org isolation, RBAC, plan-based scan limits (Free/Pro/Enterprise) |
| **Production UX** | Next.js 15 SSR, Zero-Warning ESLint codebase, strict A11y & loading skeletons |
| **Auth** | JWT + MFA (TOTP/QR), password reset, API keys, audit logging |
| **Bug Bounty** | HackerOne-compliant Markdown export + PDF reports with OWASP mappings |
| **Real-Time** | WebSocket scan progress (`/ws/scan/{id}`) with granular phase events |
| **Monitoring** | Prometheus metrics, Sentry error tracking, Flower for Celery |
| **Security** | HSTS, CSP, rate limiting, CORS hardening, prompt injection protection |

---

## 🕵️ Intelligence Hub — 9 OSINT Modules

Every module works **immediately without API keys** using free/open-source alternatives. Add premium keys anytime for enhanced capabilities.

| # | Module | Codename | Free Source | Premium Upgrade |
| --- | --- | --- | --- | --- |
| 01 | **SHODAN** | The Panopticon | Shodan InternetDB (free) | `SHODAN_API_KEY` → Pro banners, screenshots |
| 02 | **MALTEGO** | Link Analysis | Built-in canvas graph engine | — |
| 03 | **BABEL X** | The Linguistic Mesh | Ahmia.fi Tor + PasteBin dumps | `BABELX_API_KEY` → Enterprise |
| 04 | **SPIDERFOOT** | Recon Automation | ipinfo + ThreatCrowd + URLScan | — |
| 05 | **SOCIAL LINKS** | Neural De-Masking | Sherlock scanner (11 platforms) | `SOCIAL_LINKS_API_KEY` → Enterprise |
| 06 | **INTEL X** | Archive of Secrets | HIBP + Wayback Machine | `INTELX_API_KEY` → Pro |
| 07 | **RECON-NG** | The Framework | HackerTarget + HTTP fingerprint | — |
| 08 | **CENSYS** | The Global Radar | crt.sh + direct TLS inspection | `CENSYS_API_ID` → Pro |
| 09 | **OSINT IND.** | The Interceptor | Gravatar + GitHub + DNS MX | `OSINT_INDUSTRIES_API_KEY` → Pro |

### Target Types Supported

| Type | Example | Modules Available |
| --- | --- | --- |
| 🌐 Domain | `example.com` | All 9 modules |
| 📌 IP Address | `8.8.8.8` | Shodan, Censys, SpiderFoot, Recon-ng |
| 📧 Email | `user@company.com` | OSINT Ind., Intel X, Dark Web |
| 👤 Username | `johndoe` | Identity, Intel X, Dark Web |
| 📱 Phone | `+1234567890` | OSINT Industries |

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 15 Frontend                       │
│  Dashboard │ Asset Inventory │ Intelligence Hub │ Scans     │
│  Reports   │ AutoFix │ AI Copilot │ Team │ Settings │ Plan │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST + WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│              FastAPI Backend (64+ endpoints)                 │
│  Auth │ Scan │ Assets │ Reports │ AI │ Intelligence │ MFA   │
│  ┌──────────────────────────────────────────────┐           │
│  │  Intelligence Hub (9 OSINT modules)          │           │
│  │  Shodan → Censys → IntelX → SpiderFoot →    │           │
│  │  Recon-ng → DarkWeb → Identity → Maltego     │           │
│  └──────────────────────────────────────────────┘           │
│  ┌──────────────────────────────────────────────┐           │
│  │  Multi-Agent AI System                       │           │
│  │  ReconAgent → ScannerAgent → ReportAgent     │           │
│  └──────────────────────────────────────────────┘           │
│  ┌──────────────────────────────────────────────┐           │
│  │  Prometheus │ Sentry │ Audit Logs │ Vault    │           │
│  └──────────────────────────────────────────────┘           │
└──┬──────────┬──────────┬──────────────────────┬─────────────┘
   │          │          │                      │
   ▼          ▼          ▼                      ▼
PostgreSQL   Redis    Celery Workers      Vector Store
  (v2 tables) ▲          │                 (RAG/FAISS)
              │          ▼
           Flower    Scheduled Scans
```

---

## 🗄️ Database Models

| Model | Table | Purpose |
| --- | --- | --- |
| `Organization` | `organizations` | Multi-tenant isolation |
| `User` | `users` | Auth + RBAC |
| `Scan` | `scans` | Scan records |
| `Finding` | `findings` | Granular vulnerability rows |
| `Asset` | `assets` | Attack surface inventory |
| `AgentLog` | `agent_logs` | AI agent reasoning trail |
| `ScanSchedule` | `schedules` | Cron-based scans |
| `APIKey` | `api_keys` | Programmatic access |
| `Webhook` | `webhooks` | Event webhooks |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- Node.js 20+
- PostgreSQL 16 (production) or SQLite (development)

### Local Development

```bash
# Clone
git clone https://github.com/sagarpritam/SageAI.git
cd SageAI

# Backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # Edit with your settings

# Database migration
alembic upgrade head

# Frontend
cd sage-web && npm install && cd ..

# Start both
uvicorn app.main:app --reload          # Backend  → http://localhost:8000
cd sage-web && npm run dev             # Frontend → http://localhost:3000
```

### Docker (Full Stack)

```bash
docker compose -f docker/docker-compose.yml up -d
```

Spins up **7 services**:

| Service | Port | Description |
| --- | --- | --- |
| `sage-backend` | 8000 | FastAPI + Gunicorn |
| `sage-frontend` | 80 | Nginx + React |
| `sage-db` | 5432 | PostgreSQL 16 |
| `sage-redis` | 6379 | Redis 7 |
| `sage-worker` | — | Celery (4 workers) |
| `sage-beat` | — | Celery Beat scheduler |
| `sage-flower` | 5555 | Flower monitoring UI |

---

## 📡 API Reference (64+ Endpoints)

### Core

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Health check (DB status, version, module count) |
| `GET` | `/metrics` | Prometheus metrics |

### Auth
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Create account + org |
| `POST` | `/auth/login` | JWT login |
| `POST` | `/auth/mfa/setup` | Enable TOTP MFA |
| `POST` | `/auth/mfa/verify` | Verify MFA code |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password` | Reset password |

### Scanning
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/scan` | Run 11-scanner + OSINT pipeline |
| `GET` | `/scan/{id}` | Get scan result |
| `GET` | `/scans` | List scans (org-scoped) |
| `GET` | `/scan/{id}/findings` | Get granular findings |
| `WS` | `/ws/scan/{id}` | Real-time scan progress |

### Intelligence Hub
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/intelligence/sweep` | Full 9-module intelligence sweep |
| `POST` | `/intelligence/shodan` | Shodan: The Panopticon |
| `POST` | `/intelligence/censys` | Censys: The Global Radar |
| `POST` | `/intelligence/intelx` | Intel X: Archive of Secrets |
| `POST` | `/intelligence/osint-industries` | OSINT Ind.: The Interceptor |
| `POST` | `/intelligence/spiderfoot` | SpiderFoot: Recon Automation |
| `POST` | `/intelligence/recon-ng` | Recon-ng: The Framework |
| `POST` | `/intelligence/darkweb` | Babel X: The Linguistic Mesh |
| `POST` | `/intelligence/identity` | Social Links: Neural De-Masking |
| `POST` | `/intelligence/graph` | Maltego: Link Analysis Graph |
| `GET` | `/intelligence/modules` | List all modules & tier status |

### Asset Inventory
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/assets/discover` | Start async asset discovery |
| `POST` | `/assets/discover/sync` | Synchronous asset discovery |
| `GET` | `/assets` | List all assets (paginated, filterable) |
| `GET` | `/assets/summary` | Attack surface summary stats |
| `GET` | `/assets/high-risk` | High-risk assets only |
| `GET` | `/assets/new` | Recently discovered assets |
| `GET` | `/assets/{id}` | Asset detail |
| `DELETE` | `/assets/{id}` | Remove asset |

### Reports & Exports
| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/reports/{id}` | JSON report |
| `GET` | `/reports/{id}/pdf` | Downloadable PDF (ReportLab) |
| `GET` | `/reports/{id}/hackerone` | HackerOne Markdown export |

### AI (Copilot + Agents)
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/ai/chat` | Context-aware AI Copilot |
| `POST` | `/ai/command` | AI command execution |
| `GET` | `/explain/{type}` | OWASP-aligned vuln explanation |
| `POST` | `/agents/assess` | Full multi-agent assessment |
| `POST` | `/agents/assess/async` | Async agent assessment |
| `GET` | `/agents/status` | Agent system status |
| `GET` | `/agents/graph/paths` | Knowledge Graph attack paths |
| `GET` | `/agents/plugins` | Plugin marketplace |
| `POST` | `/agents/plugins/run` | Run a specific plugin |
| `POST` | `/agents/plugins/run-all` | Run all plugins for a target |

### Management
| Method | Endpoint | Description |
| --- | --- | --- |
| `CRUD` | `/api-keys/*` | Programmatic API key management |
| `CRUD` | `/webhooks/*` | Webhook management |
| `CRUD` | `/schedules/*` | Scheduled scan management |
| `POST` | `/billing/checkout` | Stripe checkout session |
| `CRUD` | `/integrations/github/*` | GitHub token management |
| `POST` | `/autofix/run` | AI-powered auto-fix |

---

## 🧪 Testing

```bash
# Activate venv first
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run full test suite (45 tests)
PYTHONPATH=. pytest tests/ -v

# Test breakdown:
#   test_auth.py          — Auth flow + health check (8 tests)
#   test_scans.py         — Scan pipeline (4 tests)
#   test_ai_resilience.py — Circuit breaker, sanitization, token tracking (13 tests)
#   test_config.py        — Production validation, CORS parsing (11 tests)
#   test_assets.py        — Asset inventory (5 tests)
#   test_reports.py       — PDF + HackerOne export (4 tests)
```

---

## 🔒 Security Architecture

| Feature | Implementation |
| --- | --- |
| **Circuit Breaker** | OpenAI calls fail-fast after 3 consecutive failures |
| **Prompt Injection Protection** | 12 regex patterns sanitize scanner output before LLM |
| **Token Budget Tracking** | Per-org LLM usage with configurable limits |
| **Production Validator** | Blocks SQLite, weak secrets, wildcard CORS in production |
| **Vault Integration** | AWS Secrets Manager, Azure Key Vault, HashiCorp Vault |
| **Rate Limiting** | SlowAPI — per-IP with configurable thresholds |
| **SAST/DAST** | Bandit + Trivy in CI/CD pipeline |
| **Dependabot** | Auto-CVE scanning for pip, npm, GitHub Actions |

---

## 📊 Monitoring

| Tool | Purpose | Access |
| --- | --- | --- |
| **Prometheus** | API latency, request rates, error rates | `/metrics` |
| **Flower** | Celery queue depth, worker health, task failures | `localhost:5555` |
| **Sentry** | Exception tracking, performance monitoring | Dashboard |
| **Health Check** | DB connectivity, scanner count, version | `GET /` |

---

## 🌐 Deployment

Pre-configured for:
- **Render** — `render.yaml` blueprint
- **Railway** — `railway.toml`
- **Heroku** — `Procfile`
- **Docker** — Multi-stage Dockerfiles + Compose

### Required Environment Variables

```env
DATABASE_URL=postgresql+asyncpg://sageai:pass@db:5432/sageai
SECRET_KEY=your-production-secret-min-32-chars
ENV=production
CORS_ORIGINS=https://your-domain.com

# Optional — AI
OPENAI_API_KEY=sk-...

# Optional — Intelligence Hub (free alternatives used when not set)
SHODAN_API_KEY=...
CENSYS_API_ID=...
CENSYS_API_SECRET=...
INTELX_API_KEY=...
HIBP_API_KEY=...
OSINT_INDUSTRIES_API_KEY=...
SOCIAL_LINKS_API_KEY=...
BABELX_API_KEY=...

# Optional — Integrations
VIRUSTOTAL_API_KEY=...
STRIPE_SECRET_KEY=sk_live_...
SENTRY_DSN=https://...
```

See [`.env.example`](.env.example) for the full list.

---

## 📁 Project Structure

```
SageAI/
├── app/
│   ├── core/              # Config, database, security, JWT
│   ├── models/            # SQLAlchemy models (Scan, Finding, Asset, AgentLog...)
│   ├── routers/           # 19 API router modules
│   ├── schemas/           # Pydantic validators
│   ├── services/
│   │   ├── scanner_service.py       # 11-scanner pipeline orchestrator
│   │   ├── intelligence/            # 🆕 9 OSINT intelligence modules
│   │   │   ├── shodan_intel.py      #   01: Shodan — The Panopticon
│   │   │   ├── link_analysis.py     #   02: Maltego — Link Analysis
│   │   │   ├── darkweb_intel.py     #   03: Babel X — The Linguistic Mesh
│   │   │   ├── spiderfoot_intel.py  #   04: SpiderFoot — Recon Automation
│   │   │   ├── identity_intel.py    #   05: Social Links — Neural De-Masking
│   │   │   ├── intelx_intel.py      #   06: Intel X — Archive of Secrets
│   │   │   ├── recon_ng_intel.py    #   07: Recon-ng — The Framework
│   │   │   ├── censys_intel.py      #   08: Censys — The Global Radar
│   │   │   └── osint_industries_intel.py  # 09: OSINT Ind. — The Interceptor
│   │   ├── asset_inventory/         # Attack surface discovery
│   │   ├── agent/                   # Multi-agent AI system
│   │   ├── llm/                     # LLM Gateway + circuit breaker
│   │   ├── rag/                     # RAG vector store
│   │   ├── report_generator.py      # PDF + HackerOne Markdown
│   │   └── risk_engine.py           # CVSS-weighted risk scoring
│   ├── plugins/           # Plugin marketplace registry
│   └── middleware/        # Audit logging, security headers
├── sage-web/src/
│   ├── app/               # Next.js App Router
│   │   ├── scan/page.tsx          # Animated stats + threat gauge
│   │   ├── intelligence/page.tsx  # 🆕 9-module OSINT interface + graph
│   │   ├── team/page.tsx          # Team & RBAC Management
│   │   ├── history/page.tsx       # Past Scans
│   │   └── ...
│   └── components/        # React Components
├── alembic/               # Database migrations
├── tests/                 # 45 tests across 6 files
├── docker/                # Dockerfiles + Compose
└── .github/               # CI/CD workflows + Dependabot
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with ❤️ for the security community</strong><br>
  <sub>SageAI — From Attack Surface Discovery to Intelligence Hub to Bug Bounty Report in minutes</sub><br><br>
  <em>These tools aren't just for "research." They are for power.<br>
  In 2026, you are either the Hunter or the Data Point.<br>
  <strong>SECURE YOUR SHADOW.</strong></em>
</div>

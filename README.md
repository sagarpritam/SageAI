# 🛡️ SageAI 2.0 — AI-Powered Enterprise Security Platform

> **SageAI 2.0** is a YC-grade AI cybersecurity platform built for Attack Surface Management, automated penetration testing, and Bug Bounty — powered by FastAPI, React, and a Multi-Agent AI architecture.

[![Tests](https://img.shields.io/badge/tests-45%20passing-brightgreen)](tests/)
[![Version](https://img.shields.io/badge/version-2.0.0-blueviolet)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Stack](https://img.shields.io/badge/stack-FastAPI%20%7C%20React%20%7C%20SQLAlchemy-informational)](#)

---

## 🚀 What's New in v2.0

| Feature | Description |
|---------|-------------|
| 🗺️ **Asset Inventory** | Full Attack Surface Management — discover subdomains, IPs, open ports, tech stacks automatically |
| 🤖 **Multi-Agent AI** | Specialized agent team: `ReconAgent`, `ScannerAgent`, `ExploitAgent`, `ReportAgent` |
| 🧠 **Context-Aware Copilot** | AI Copilot with live scan context injection — ask "how do I fix the SQLi you just found?" |
| 🔍 **Finding Database** | Vulnerabilities stored in dedicated `findings` table (not JSON) — filterable by CVSS, severity, asset |
| 📝 **HackerOne Export** | One-click Bug Bounty report export in HackerOne Markdown format |
| 🔬 **Agent Logs** | Full reasoning trail — see exactly what each AI agent did during your scan |
| 📡 **WebSocket Streams** | Real-time scan progress events streamed to the terminal UI |
| 🔐 **Security Knowledge Graph** | MITRE ATT&CK-aligned attack path visualization |
| 🔌 **Plugin Marketplace** | Extensible plugin system for custom security checks |

---

## ⚡ Feature Matrix

| Category | Capabilities |
|----------|-------------|
| **Scanning** | 11-scanner pipeline: Security Headers, XSS, SQLi, SSL/TLS, Port Scan, DNS + OSINT (Shodan, CRT.sh, Mozilla Observatory, VirusTotal, NVD CVE) |
| **Asset Discovery** | Subdomain enum (crt.sh), DNS resolution, Shodan port data, HTTP probing, risk scoring per asset |
| **AI Analysis** | GPT-4o-mini with RAG knowledge base + live scan context injection + circuit breaker |
| **Multi-Agent** | ReconAgent → ScannerAgent → ExploitAgent → ReportAgent pipeline |
| **Risk Engine** | OSINT-aware CVSS-weighted risk scoring with attack surface correlation |
| **Multi-Tenant** | Org isolation, RBAC, plan-based scan limits (Free/Pro/Enterprise) |
| **Auth** | JWT + MFA (TOTP/QR), password reset, API keys, audit logging |
| **Bug Bounty** | HackerOne-compliant Markdown export + PDF reports with OWASP mappings |
| **Real-Time** | WebSocket scan progress (`/ws/scan/{id}`) with granular phase events |
| **Monitoring** | Prometheus metrics, Sentry error tracking, Flower for Celery |
| **Security** | HSTS, CSP, rate limiting, CORS hardening, prompt injection protection |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend (Vite)                 │
│  Dashboard │ Asset Inventory │ Scans │ AI Copilot       │
│  Reports   │ AutoFix         │ Team  │ Settings │ Plan  │
└─────────────────────────┬───────────────────────────────┘
                          │ REST + WebSocket
┌─────────────────────────▼───────────────────────────────┐
│              FastAPI Backend (52+ endpoints)            │
│  Auth │ Scan │ Assets │ Reports │ AI │ Billing │ MFA    │
│  ┌────────────────────────────────────────────┐         │
│  │  Multi-Agent AI System                     │         │
│  │  ReconAgent → ScannerAgent → ReportAgent   │         │
│  └────────────────────────────────────────────┘         │
│  ┌────────────────────────────────────────────┐         │
│  │  Prometheus │ Sentry │ Audit Logs │ Vault  │         │
│  └────────────────────────────────────────────┘         │
└──┬──────────┬──────────┬──────────────────────┬─────────┘
   │          │          │                      │
   ▼          ▼          ▼                      ▼
PostgreSQL   Redis    Celery Workers      Vector Store
  (v2 tables) ▲          │                 (RAG/FAISS)
              │          ▼
           Flower    Scheduled Scans
```

---

## 🗄️ Database Models (v2)

| Model | Table | Purpose |
|-------|-------|---------|
| `Organization` | `organizations` | Multi-tenant isolation |
| `User` | `users` | Auth + RBAC |
| `Scan` | `scans` | Scan records |
| **`Finding`** | **`findings`** | **Granular vulnerability rows (NEW v2)** |
| **`Asset`** | **`assets`** | **Attack surface inventory (NEW v2)** |
| **`AgentLog`** | **`agent_logs`** | **AI agent reasoning trail (NEW v2)** |
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
cd frontend && npm install && cd ..

# Start both
uvicorn app.main:app --reload          # Backend  → http://localhost:8000
cd frontend && npm run dev             # Frontend → http://localhost:5173
```

### Docker (Full Stack)

```bash
docker compose -f docker/docker-compose.yml up -d
```

Spins up **7 services**:

| Service | Port | Description |
|---------|------|-------------|
| `sage-backend` | 8000 | FastAPI + Gunicorn |
| `sage-frontend` | 80 | Nginx + React |
| `sage-db` | 5432 | PostgreSQL 16 |
| `sage-redis` | 6379 | Redis 7 |
| `sage-worker` | — | Celery (4 workers) |
| `sage-beat` | — | Celery Beat scheduler |
| `sage-flower` | 5555 | Flower monitoring UI |

---

## 📡 API Reference (v2.0 — 52+ Endpoints)

### Core
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check (DB status, version, scanner count) |
| `GET` | `/metrics` | Prometheus metrics |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create account + org |
| `POST` | `/auth/login` | JWT login |
| `POST` | `/auth/mfa/setup` | Enable TOTP MFA |
| `POST` | `/auth/mfa/verify` | Verify MFA code |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password` | Reset password |

### Scanning
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/scan` | Run 11-scanner + OSINT pipeline |
| `GET` | `/scan/{id}` | Get scan result |
| `GET` | `/scans` | List scans (org-scoped) |
| **`GET`** | **`/scan/{id}/findings`** | **Get granular findings (NEW v2)** |
| `WS` | `/ws/scan/{id}` | Real-time scan progress |

### Asset Inventory (NEW v2)
| Method | Endpoint | Description |
|--------|----------|-------------|
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
|--------|----------|-------------|
| `GET` | `/reports/{id}` | JSON report |
| `GET` | `/reports/{id}/pdf` | Downloadable PDF (ReportLab) |
| **`GET`** | **`/reports/{id}/hackerone`** | **HackerOne Markdown export (NEW v2)** |

### AI (Copilot + Agents)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/chat` | Context-aware AI Copilot (supports `scan_id` injection) |
| `POST` | `/ai/command` | AI command execution |
| `GET` | `/explain/{type}` | OWASP-aligned vulnerability explanation |
| `POST` | `/agents/assess` | Full multi-agent security assessment |
| `POST` | `/agents/assess/async` | Async agent assessment |
| `GET` | `/agents/status` | Agent system status |
| `GET` | `/agents/graph/paths` | Security Knowledge Graph attack paths |
| `GET` | `/agents/plugins` | Plugin marketplace listing |
| `POST` | `/agents/plugins/run` | Run a specific plugin |
| `POST` | `/agents/plugins/run-all` | Run all plugins for a target |

### Organization & Team
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/org/plan` | Current org plan |
| `GET` | `/org/plans` | Available plans |
| `GET` | `/org/users` | Team members |
| `PATCH` | `/org/users/{id}/role` | Update member role |
| `GET` | `/org/stats` | Organization statistics |

### Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `CRUD` | `/api-keys/*` | Programmatic API key management |
| `CRUD` | `/webhooks/*` | Webhook management |
| `CRUD` | `/schedules/*` | Scheduled scan management |
| `POST` | `/billing/checkout` | Stripe checkout session |
| `POST` | `/billing/webhook` | Stripe event webhook |
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
|---------|---------------|
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
|------|---------|--------|
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

# Optional integrations
OPENAI_API_KEY=sk-...
SHODAN_API_KEY=...
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
│   ├── routers/           # 18 API router modules
│   ├── schemas/           # Pydantic validators
│   ├── services/
│   │   ├── scanner_service.py       # 11-scanner pipeline orchestrator
│   │   ├── asset_inventory/         # Attack surface discovery
│   │   ├── agent/                   # Multi-agent AI system
│   │   ├── llm/                     # LLM Gateway + circuit breaker
│   │   ├── rag/                     # RAG vector store
│   │   ├── report_generator.py      # PDF + HackerOne Markdown
│   │   └── risk_engine.py           # CVSS-weighted risk scoring
│   ├── plugins/           # Plugin marketplace registry
│   └── middleware/        # Audit logging, security headers
├── frontend/src/
│   ├── pages/             # 13 React pages
│   │   ├── Dashboard.jsx       # Animated stats + threat gauge
│   │   ├── AssetInventory.jsx  # Attack Surface Management
│   │   ├── Scans.jsx           # Terminal-style scan execution
│   │   ├── Copilot.jsx         # Context-aware AI chat
│   │   ├── Reports.jsx         # PDF + HackerOne export
│   │   └── ...
│   └── api.js             # Centralized Axios API client
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
  <sub>SageAI 2.0 — From Attack Surface Discovery to Bug Bounty Report in minutes</sub>
</div>

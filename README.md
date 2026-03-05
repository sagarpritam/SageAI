# 🛡️ SageAI — Enterprise Security Scanner

SageAI is a **production-grade cybersecurity platform** that combines automated vulnerability scanning, OSINT intelligence, AI-powered analysis, and multi-tenant SaaS — built with FastAPI, React, and industrial DevOps practices.

## ⚡ Key Features

| Category | Capabilities |
|----------|-------------|
| **Scanning** | 11-scanner pipeline (Security Headers, XSS, SQLi, SSL/TLS, Port, DNS) + OSINT (Shodan, CRT.sh, Mozilla Observatory, VirusTotal, NVD CVE) |
| **AI Analysis** | GPT-4o-mini explanations with circuit breaker, prompt injection protection, per-org token tracking |
| **Real-Time** | WebSocket live scan progress (`/ws/scan/{id}`) |
| **Risk Engine** | OSINT-aware scoring with CVSS-weighted calculations |
| **Multi-Tenant** | Organization isolation, role-based access, plan-based scan limits |
| **Auth** | JWT + MFA (TOTP with QR), password reset, API keys |
| **Billing** | Stripe integration (Free/Pro/Enterprise tiers) |
| **Reports** | PDF/JSON/YAML export with OWASP mappings |
| **Monitoring** | Prometheus metrics, Sentry error tracking, Flower for Celery |
| **Security** | HSTS, CSP, rate limiting, CORS hardening, audit logging |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│             React Frontend (Vite)           │
│  Dashboard │ Scans │ Team │ Settings │ Plan │
└──────────────────┬──────────────────────────┘
                   │ REST + WebSocket
┌──────────────────▼──────────────────────────┐
│          FastAPI Backend (32 endpoints)      │
│  Auth │ Scan │ Report │ AI │ Billing │ MFA  │
│  ┌─────────────────────────────────┐        │
│  │  Prometheus │ Sentry │ Audit    │        │
│  └─────────────────────────────────┘        │
└──┬──────────┬──────────┬────────────────────┘
   │          │          │
   ▼          ▼          ▼
PostgreSQL   Redis    Celery Workers
             ▲          │
             │          ▼
          Flower    Scheduled Scans
```

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- Node.js 20+
- PostgreSQL 16 (production) or SQLite (dev only)

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

This spins up **7 services**:

| Service | Port | Description |
|---------|------|-------------|
| `sage-backend` | 8000 | FastAPI + Gunicorn |
| `sage-frontend` | 80 | Nginx + React |
| `sage-db` | 5432 | PostgreSQL 16 |
| `sage-redis` | 6379 | Redis 7 |
| `sage-worker` | — | Celery (4 workers) |
| `sage-beat` | — | Celery Beat scheduler |
| `sage-flower` | 5555 | Flower monitoring UI |

## 📡 API Endpoints (32)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check (DB status, scanner count) |
| `GET` | `/metrics` | Prometheus metrics |
| `POST` | `/auth/register` | Create account + org |
| `POST` | `/auth/login` | JWT login |
| `GET` | `/auth/me` | Current user profile |
| `POST` | `/scan` | Run security scan |
| `GET` | `/scan/{id}` | Get scan result |
| `GET` | `/scans` | List scans (org-scoped) |
| `WS` | `/ws/scan/{id}` | Real-time scan progress |
| `GET` | `/report/{id}/pdf` | PDF report |
| `GET` | `/report/{id}/json` | JSON export |
| `GET` | `/report/{id}/yaml` | YAML export |
| `POST` | `/explain/{type}` | AI vulnerability explanation |
| `POST` | `/explain/scan/{id}` | AI scan summary |
| `POST` | `/mfa/setup` | Enable TOTP |
| `POST` | `/mfa/verify` | Verify MFA code |
| `POST` | `/password/forgot` | Request reset |
| `POST` | `/password/reset` | Reset password |
| `CRUD` | `/api-keys/*` | API key management |
| `CRUD` | `/webhooks/*` | Webhook management |
| `CRUD` | `/schedules/*` | Scheduled scans |
| `CRUD` | `/org/*` | Organization + team |
| `POST` | `/billing/checkout` | Stripe checkout |
| `POST` | `/billing/webhook` | Stripe webhook |

## 🧪 Testing

```bash
# Run all tests
pytest tests/ -v

# Test categories:
#   test_auth.py          — Auth + health check (8 tests)
#   test_scans.py         — Scan pipeline (4 tests)
#   test_ai_resilience.py — Circuit breaker, sanitization, token tracking (13 tests)
#   test_config.py        — Production validation, CORS parsing (11 tests)
```

## 🔒 Security Features

- **Circuit Breaker** — OpenAI calls fail-fast after 3 consecutive failures
- **Prompt Injection Protection** — 12 regex patterns sanitize scanner output before LLM
- **Token Tracking** — Per-org LLM usage with budget limits
- **Production Validator** — Blocks SQLite, weak secrets, and wildcard CORS in production
- **Vault Integration** — Secrets from AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault
- **SAST/DAST** — Bandit + Trivy in CI/CD pipeline
- **Dependabot** — Auto-scans pip, npm, and GitHub Actions for CVEs

## 📊 Monitoring

| Tool | Purpose | Access |
|------|---------|--------|
| **Prometheus** | API latency, request rates, error rates | `/metrics` |
| **Flower** | Celery queue depth, worker health, task failures | `localhost:5555` |
| **Sentry** | Exception tracking, performance monitoring | Dashboard |
| **Health Check** | DB connectivity, scanner count, version | `GET /` |

## 🌐 Deployment

Pre-configured for:
- **Render** — `render.yaml` blueprint
- **Railway** — `railway.toml`
- **Heroku** — `Procfile`
- **Docker** — Multi-stage Dockerfiles + Compose

### Required Environment Variables

```
DATABASE_URL=postgresql+asyncpg://sageai:pass@db:5432/sageai
SECRET_KEY=your-production-secret
ENV=production
CORS_ORIGINS=https://your-domain.com
```

See [`.env.example`](.env.example) for full list.

## 📁 Project Structure

```
SageAI/
├── app/
│   ├── core/           # Config, database, security
│   ├── models/         # SQLAlchemy models
│   ├── routers/        # API endpoints (12 modules)
│   ├── schemas/        # Pydantic validators
│   ├── services/       # Scanner pipeline, AI, risk engine
│   └── middleware/      # Audit logging, security headers
├── frontend/src/
│   ├── pages/          # 11 React pages
│   └── api.js          # API client
├── docker/             # Dockerfiles + Compose
├── tests/              # 36 tests across 5 files
├── alembic/            # Database migrations
└── .github/            # CI/CD + Dependabot
```

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

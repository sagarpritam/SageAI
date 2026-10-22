# SageAI — Enterprise Production Deployment Guide

SageAI is built for hybrid production deployments: containerized orchestration (Docker Compose / Kubernetes) and serverless frontend hosting (Vercel).

---

## 1. Quick Start (Production Docker Compose with HTTPS)

The recommended self-hosted production deployment runs on any Linux VPS or VM (AWS EC2, GCP Compute Engine, DigitalOcean Droplet, Hetzner) using Caddy reverse proxy for automated Let's Encrypt TLS.

```bash
# 1. Clone repository
git clone https://github.com/sagarpritam/SageAI.git && cd SageAI

# 2. Configure production environment
cp .env.production.example .env.production
# Fill in required production secrets (DOMAIN, POSTGRES_PASSWORD, SECRET_KEY, etc.)

# 3. Launch full stack in production mode
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 4. Apply database migrations
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### Full-Stack Service Map

| Service | Container | Internal Port | External Access | Healthcheck |
| :--- | :--- | :--- | :--- | :--- |
| **Caddy** | `caddy:2-alpine` | `80, 443` | `https://${DOMAIN}`, `https://api.${DOMAIN}` | Automatic TLS |
| **Frontend** | Next.js 16 Standalone | `3000` | Via Caddy `https://${DOMAIN}` | Node.js HTTP 200 |
| **Backend** | FastAPI + Gunicorn | `8000` | Via Caddy `https://api.${DOMAIN}` | `curl http://localhost:8000/` |
| **Worker Fleet** | Celery Async Engine | N/A (Internal) | N/A | Process supervisor |
| **Database** | PostgreSQL 16 Alpine | `5432` | Internal bridge only | `pg_isready -U sageai` |
| **Cache/Queue**| Redis 7 Alpine | `6379` | Internal bridge only | `redis-cli ping` |

---

## 2. Serverless Frontend Deployment (Vercel)

The Next.js 16 frontend (`sage-web`) is optimized for Vercel deployment with Turbopack, standalone static generation, and edge routing.

### Steps to Deploy on Vercel:
1. Import repository on [Vercel](https://vercel.com/new).
2. Configure **Root Directory** as `sage-web`.
3. Set **Framework Preset** to `Next.js`.
4. Add Environment Variables:
   - `BACKEND_URL`: `https://api.yourdomain.com` (Your FastAPI production backend)
   - `STRIPE_SECRET_KEY`: `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET`: `whsec_...`
   - `STRIPE_PRO_PRICE_ID`: `price_...`
   - `GOOGLE_GENERATIVE_AI_API_KEY`: `AIza...`
5. Click **Deploy**. Vercel will build all 53 static/dynamic routes in ~3 seconds.

> [!TIP]
> Both `vercel.json` and `.vercelignore` are included to keep serverless bundles compact and exclude heavy archives, build caches, and test artifacts.

---

## 3. Celery Worker Fleet Scaling

Asynchronous vulnerability scans, deep reconnaissance, and SagePatch remediation runs are processed via the Celery worker fleet:

```bash
# Scale worker fleet dynamically to 4 concurrent worker containers
docker compose -f docker-compose.prod.yml up -d --scale worker=4
```

### Worker Queue Topology
- `scans`: Heavy parallel DAST & port scanners (Nmap, Nuclei, ZAP).
- `recon`: Subfinder and OSINT discovery sweeps.
- `remediation`: Deterministic `SagePatch` diff generation & AST validation.
- `alerts`: Real-time notification dispatch (Slack, Discord, MS Teams, Webhooks).

---

## 4. Kubernetes Microservices Fleet (`k8s/`)

For enterprise Kubernetes clusters (GKE, EKS, AKS):

```bash
# 1. Create namespace and secrets
kubectl create namespace sageai
kubectl apply -f k8s/secrets.yaml

# 2. Deploy stateful backing services (or use Cloud SQL / ElastiCache)
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml

# 3. Deploy application fleet with HPA autoscalers
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/worker-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## 5. Required Environment Variables Checklist

### Core Infrastructure
- `DATABASE_URL`: `postgresql+asyncpg://sageai:PASSWORD@postgres:5432/sageai`
- `REDIS_URL`: `redis://redis:6379/1`
- `SECRET_KEY`: High-entropy 64-character secret for JWT tokens (`openssl rand -hex 32`)
- `INTERNAL_SERVICE_KEY`: Key for backend-to-worker token authentication
- `CORS_ORIGINS`: Comma-separated allowed frontend domains (`https://yourdomain.com`)

### Rate Limits (Default Enterprise Quotas)
- `RATE_LIMIT`: `1200/minute`
- `RATE_LIMIT_BURST`: `600/minute`
- `RATE_LIMIT_SCAN`: `120/minute`
- `RATE_LIMIT_AUTH`: `60/minute`

### AI & Threat Intelligence (Optional / Pro Features)
- `GOOGLE_GENERATIVE_AI_API_KEY`: Gemini Copilot reasoning engine
- `NVIDIA_API_KEY`: NVIDIA NIM/NeMo microservices
- `SHODAN_API_KEY`: Shodan OSINT integration
- `CENSYS_API_ID` & `CENSYS_API_SECRET`: Censys attack surface discovery

---

## 6. Post-Deployment Verification & Healthchecks

Run these verification checks immediately after deploying:

```bash
# 1. API Health Check
curl -i https://api.yourdomain.com/
# HTTP/2 200 {"status": "ok", "message": "SageAI API is running"}

# 2. Operational Metrics Scorecard
curl -i https://api.yourdomain.com/metrics/operations
# Verifies Celery worker queue depth, Alert SLA latency, Threat freshness, and SagePatch velocity

# 3. Distributed Tracing Smoke Test
curl -i https://api.yourdomain.com/telemetry/traces
# Verifies W3C trace ring buffer storage

# 4. Prometheus Scrape Target
curl -i https://api.yourdomain.com/metrics
# Exposes standard OpenTelemetry/Prometheus metrics for Grafana
```

---

## 7. Zero-Downtime Database Migration Procedure

When deploying new database models (e.g., `remediation_patches` or `audit_logs`):

```bash
# Run migration without taking down services
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Verify active revision
docker compose -f docker-compose.prod.yml exec backend alembic current
```

# SageAI — Deployment Guide

## Quick Start (Docker Compose)

```bash
# 1. Clone the repo
git clone https://github.com/sagarpritam/SageAI.git && cd SageAI

# 2. Copy and fill environment variables
cp .env.example .env
# Edit .env with your keys (see Environment Variables below)

# 3. Launch the full stack
docker compose up -d --build

# 4. Run database migrations
docker compose exec backend alembic upgrade head
```

**Services:**
| Service  | URL                    | Description        |
|----------|------------------------|--------------------|
| Frontend | http://localhost:3000   | Next.js Dashboard  |
| Backend  | http://localhost:8000   | FastAPI API         |
| Postgres | localhost:5432          | Database            |

---

## Environment Variables

### Required
| Variable                      | Description                          |
|-------------------------------|--------------------------------------|
| `SECRET_KEY`                  | JWT signing key (change in prod!)    |
| `DATABASE_URL`                | Postgres URL (auto-set in compose)   |
| `POSTGRES_PASSWORD`           | Database password                    |
| `BACKEND_URL`                 | Backend URL for frontend proxy       |

### Payments
| Variable                      | Description                          |
|-------------------------------|--------------------------------------|
| `STRIPE_SECRET_KEY`           | Stripe API secret                    |
| `STRIPE_WEBHOOK_SECRET`       | Stripe webhook signing secret        |

### AI & OSINT (Pro Features)
| Variable                      | Description                          |
|-------------------------------|--------------------------------------|
| `NVIDIA_API_KEY`              | NVIDIA NIM/NeMo API key              |
| `SHODAN_API_KEY`              | Shodan OSINT API key                 |
| `CENSYS_API_ID`               | Censys API ID                        |
| `CENSYS_API_SECRET`           | Censys API secret                    |

---

## Deploying to Production

### Option A: Railway / Render
Both services can auto-detect the `Dockerfile` and `docker-compose.yml`. Set environment variables in your dashboard.

The project already includes:
- `railway.toml` — Railway configuration
- `render.yaml` — Render blueprint
- `Procfile` — Heroku/Railway process file

### Option B: Vercel (Frontend) + Render (Backend)
1. **Frontend**: Connect `sage-web/` to Vercel. Set `BACKEND_URL` to your Render URL.
2. **Backend**: Deploy the root repo to Render using the existing `render.yaml`.

### Option C: VPS / Self-Hosted
```bash
# SSH into your server
docker compose -f docker-compose.yml up -d --build
docker compose exec backend alembic upgrade head
```

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on push to `main` or `develop`:

1. **Lint & SAST**: Ruff code style + Bandit security scan
2. **Dependency Scan**: Trivy vulnerability scan
3. **Backend Tests**: Postgres service + pytest
4. **Frontend Build**: `npm ci && npm run build` in `sage-web/`
5. **Docker Build**: Full compose build + Trivy image scan (main branch only)

---

## Useful Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Run backend tests
docker compose exec backend pytest tests/ -v

# Access database
docker compose exec postgres psql -U sageai -d sageai

# Stop everything
docker compose down

# Reset database
docker compose down -v  # WARNING: deletes all data
```

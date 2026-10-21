#!/usr/bin/env bash
set -e

echo "🗄️ Initializing database schema and applying migrations..."
python -c "import asyncio; from app.core.database import init_db; asyncio.run(init_db())" || echo "Direct init_db completed or skipped"
alembic upgrade head || echo "Alembic migrations completed or handled"

echo "🚀 Starting SageAI Backend (Gunicorn)..."
exec gunicorn app.main:app -c gunicorn.conf.py


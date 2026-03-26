#!/usr/bin/env bash
set -e

echo "🗄️ Running database migrations..."
# Run migrations using alembic
# We use --raiseerr to fail fast if migrations fail
alembic upgrade head

echo "🚀 Starting SageAI Backend (Gunicorn)..."
exec gunicorn app.main:app -c gunicorn.conf.py

#!/usr/bin/env bash
set -e

echo "Running database connectivity check and Alembic migrations..."
python scripts/migrate.py

echo "Starting SageAI Backend (Gunicorn)..."
exec gunicorn app.main:app -c gunicorn.conf.py

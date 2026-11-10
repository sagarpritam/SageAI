#!/usr/bin/env bash
# ============================================
# SageAI — Production Deployment Script
# Run this script on your VPS whenever you
# push new code to your repository.
# ============================================

set -e

echo "Starting SageAI Deployment..."

echo "Pulling latest code..."
git pull origin main

echo "Rebuilding and starting containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo "Waiting for Postgres health and applying migrations..."
docker compose -f docker-compose.prod.yml exec -T backend python scripts/migrate.py

echo "Cleaning up unused Docker images..."
docker image prune -f

echo "Deployment completed successfully!"

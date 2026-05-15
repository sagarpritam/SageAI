#!/bin/bash
# ============================================
# SageAI — Production Deployment Script
# Run this script on your VPS whenever you
# push new code to your repository.
# ============================================

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting SageAI Deployment..."

# 1. Pull the latest code from the current branch
echo "📦 Pulling latest code..."
git pull origin main

# 2. Rebuild and restart the Docker Compose stack in detached mode
echo "🐳 Rebuilding and starting containers..."
docker compose -f docker-compose.prod.yml up -d --build

# 3. Wait a few seconds for Postgres to be healthy before running migrations
echo "⏳ Waiting 10 seconds for database health..."
sleep 10

# 4. Run database migrations inside the backend container
echo "🛠️ Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T backend alembic upgrade head

# 5. Clean up old, unused Docker images to free up disk space
echo "🧹 Cleaning up unused Docker images..."
docker image prune -f

echo "✅ Deployment completed successfully!"

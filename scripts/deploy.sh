#!/usr/bin/env bash

# SageAI Deployment Script (Linux & macOS)

set -e

echo "==============================================="
echo "🛡️   SageAI Version 3.0 Deployment (Docker)"
echo "==============================================="

# Check requirements
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    exit 1
fi

# Ensure .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env. Please configure your API signatures inside."
    else
        echo "❌ .env.example is missing! Deployment halted."
        exit 1
    fi
fi

echo "🚀 Building container images..."
# Suppress build noise, show errors only
if docker compose version &> /dev/null; then
  docker compose -f docker/docker-compose.yml build --no-cache
else
  docker-compose -f docker/docker-compose.yml build --no-cache
fi

echo "🟢 Starting Docker services in detached mode..."
if docker compose version &> /dev/null; then
  docker compose -f docker/docker-compose.yml up -d
else
  docker-compose -f docker/docker-compose.yml up -d
fi

echo "⏳ Waiting for PostgreSQL database system to initialize (10s)..."
sleep 10

echo "🗄️ Running Alembic database migrations inside the backend container..."
if docker compose version &> /dev/null; then
  docker compose -f docker/docker-compose.yml exec -T backend alembic upgrade head
else
  docker-compose -f docker/docker-compose.yml exec -T backend alembic upgrade head
fi

echo "🌱 Seeding initial platform data (Admins, Demo Org, Assets)..."
if docker compose version &> /dev/null; then
  docker compose -f docker/docker-compose.yml exec -e ENV=development -T backend python scripts/seed_db.py
else
  docker-compose -f docker/docker-compose.yml exec -e ENV=development -T backend python scripts/seed_db.py
fi

echo ""
echo "==============================================="
echo "✅ DEPLOYMENT COMPLETE"
echo "==============================================="
echo ""
echo "🌐 Frontend URL:  http://localhost"
echo "🔌 Backend API:   http://localhost:8000"
echo "🏵️  Flower UI:    http://localhost:5555"
echo ""
echo "📝 Use 'docker compose -f docker/docker-compose.yml logs -f' to view application traces."
echo "==============================================="

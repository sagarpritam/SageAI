# SageAI Deployment Script (Windows PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🛡️   SageAI Version 3.0 Deployment (Docker)" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan

# Check for Docker CLI
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# Ensure .env exists
if (!(Test-Path -Path ".\.env")) {
    Write-Host "⚠️  No .env file found. Copying from .env.example..." -ForegroundColor Yellow
    if (Test-Path -Path ".\.env.example") {
        Copy-Item -Path ".\.env.example" -Destination ".\.env"
        Write-Host "✅ Created .env. Please configure your API signatures inside." -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example is missing! Deployment halted." -ForegroundColor Red
        exit 1
    }
}

Write-Host "🚀 Building container images..." -ForegroundColor Cyan
docker compose -f docker/docker-compose.yml build --progress=plain

Write-Host "🟢 Starting Docker services in detached mode..." -ForegroundColor Cyan
docker compose -f docker/docker-compose.yml up -d

Write-Host "⏳ Waiting for PostgreSQL database system to initialize (15s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "🗄️ Running Alembic database migrations..." -ForegroundColor Cyan
docker compose -f docker/docker-compose.yml exec -T backend alembic upgrade head

Write-Host "🌱 Seeding initial platform data (Admins, Demo Org, Assets)..." -ForegroundColor Cyan
# Run the seed with the correct env variables via exec
docker compose -f docker/docker-compose.yml exec -e ENV=development -T backend python scripts/seed_db.py

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Frontend URL:  http://localhost" -ForegroundColor White
Write-Host "🔌 Backend API:   http://localhost:8000" -ForegroundColor White
Write-Host "🏵️  Flower UI:    http://localhost:5555" -ForegroundColor White
Write-Host ""
Write-Host "📝 Use 'docker compose -f docker/docker-compose.yml logs -f' to view application traces." -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan

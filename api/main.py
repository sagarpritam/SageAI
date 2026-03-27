from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import scan, payments, export, email_reports

import os

app = FastAPI(title="SageAI Scanning API", description="Phase 5 Autonomous Scanning API")

# Enable CORS for the React frontend
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router)
app.include_router(payments.router)
app.include_router(export.router)
app.include_router(email_reports.router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "SageAI Scanning API is running"}

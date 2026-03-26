from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import scan, payments

app = FastAPI(title="SageAI Scanning API", description="Phase 5 Autonomous Scanning API")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router)
app.include_router(payments.router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "SageAI Scanning API is running"}

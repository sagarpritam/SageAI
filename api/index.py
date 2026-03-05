"""Vercel Serverless Function Entry Point for SageAI FastAPI."""

from app.main import app

# Vercel expects a variable called `app` or `handler`.
# FastAPI's ASGI app is directly compatible with Vercel's Python runtime.
# This file simply re-exports the FastAPI application instance.

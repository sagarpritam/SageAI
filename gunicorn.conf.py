"""Gunicorn production config for SageAI."""

import multiprocessing
import os

# Server
port = os.getenv("PORT", "8000")
bind = f"0.0.0.0:{port}"
_default_workers = (
    2 if os.getenv("K_SERVICE") else min(multiprocessing.cpu_count() * 2 + 1, 4)
)
workers = int(os.getenv("WEB_CONCURRENCY", str(_default_workers)))
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50

# Timeouts
timeout = 120
graceful_timeout = 30
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Security
limit_request_line = 8190
limit_request_fields = 100
limit_request_field_size = 8190

# Process naming
proc_name = "SageAI"

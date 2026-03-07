# ================================
# SageAI 2.0 — All-in-One Dockerfile
# Single container with backend only (use docker-compose for full stack)
# ================================

FROM python:3.13-slim

WORKDIR /app

# Install system deps
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/
COPY gunicorn.conf.py .

# Create non-root user
RUN addgroup --system sageai && adduser --system --group sageai
USER sageai

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

CMD ["gunicorn", "app.main:app", "-c", "gunicorn.conf.py"]

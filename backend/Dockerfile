# Multi-stage Dockerfile for Ceylon Gem Marketplace Backend (FastAPI + Clean Architecture)
FROM python:3.12-slim-bookworm AS builder

# Prevent Python from writing bytecode and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install build dependencies if needed (e.g., for compiling psycopg2 binary wheels if required)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies inside a clean virtual environment or directly to global site-packages
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/requirements.txt


FROM python:3.12-slim-bookworm AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install runtime database libraries required by psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root system user for enhanced security
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin -c "Docker App User" appuser

# Copy installed python packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy source code, scripts, and tests into /app/backend

COPY --chown=appuser:appuser app /app/backend/app
COPY --chown=appuser:appuser scripts /app/backend/scripts
COPY --chown=appuser:appuser tests /app/backend/tests

USER appuser

EXPOSE 8000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Launch uvicorn server with clean architecture entrypoint
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

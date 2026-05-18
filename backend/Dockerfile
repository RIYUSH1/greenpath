# ─── Stage: Production image ──────────────────────────────────────────────────
FROM node:20-slim

# Install Python 3, pip, and venv (needed for ML model)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create Python venv (avoids PEP 668 "externally managed" errors on Debian Bookworm)
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
# PYTHON_PATH is read by nightSafety.routes.js to spawn the ML model
ENV PYTHON_PATH="/opt/venv/bin/python"

# ── Install Node.js dependencies (cached layer) ──────────────────────────────
COPY package*.json ./
RUN npm install --omit=dev

# ── Install Python ML dependencies ───────────────────────────────────────────
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy ALL backend source files ────────────────────────────────────────────
COPY . .

# Expose application port (Render uses $PORT, defaults to 5000)
EXPOSE 5000

# Health check — give the server 60 s to start before declaring unhealthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start Node.js server
CMD ["node", "server.js"]

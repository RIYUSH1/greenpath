FROM node:20-slim

# Install Python 3, pip, and venv
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create Python venv (avoids PEP 668 pip errors on Debian Bookworm)
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHON_PATH="/opt/venv/bin/python"

# Install Node dependencies first (layer cache optimization)
COPY package*.json ./
RUN npm install --production

# Install Python ML dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy ALL backend source files
COPY . .

# Expose the application port
EXPOSE 5000

# Health check so Render knows when the container is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the Node.js server
CMD ["node", "server.js"]

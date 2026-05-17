FROM node:20-slim

# Install Python 3, pip, and necessary build tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Create a virtual environment for Python to avoid PEP 668 external-environment errors
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHON_PATH="/opt/venv/bin/python"

# Copy package files and install Node.js dependencies
COPY package*.json ./
RUN npm install --production

# Copy Python requirements and install them
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY . .

# Expose the application port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]

# Prompt 4: Docker — OmniDraft

## Vibe Profile
**Role**: DevOps Engineer + Containerization Specialist
**Product**: Production-ready Docker setup for OmniDraft — multi-stage builds, Nginx reverse proxy, single-container deployment for AWS App Runner.

## Product Brief
Containerize the full OmniDraft stack. Frontend (React build) is served by Nginx which also proxies `/api/*` requests to the FastAPI backend (Uvicorn). Single container = simpler deployment for App Runner.

## Project Goals
- Multi-stage Dockerfile: build frontend, then serve with Nginx + FastAPI
- Docker Compose for local development (hot reload)
- Production Nginx config (gzip, caching, security headers)
- Environment variables injected at runtime
- Non-root user for security
- Health check endpoint

## Tech Stack
- Docker (multi-stage build)
- Docker Compose (local dev)
- Nginx (reverse proxy, static file serving)
- Python 3.11-slim base image
- Node 20-alpine (frontend build stage)

## Architecture (Single Container)
```
Container (AWS App Runner)
├── Nginx (port 8080)
│   ├── / → serves React static build from /app/frontend/dist
│   └── /api/* → proxy_pass to http://localhost:8000
│
└── FastAPI + Uvicorn (port 8000, internal only)
    └── All API routes
```

## Dockerfile (Multi-stage)

### Stage 1: Frontend Build
```dockerfile
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build
```

### Stage 2: Backend Dependencies
```dockerfile
FROM python:3.11-slim AS backend-deps
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
```

### Stage 3: Production Image
```dockerfile
FROM python:3.11-slim
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy backend
COPY --from=backend-deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY backend/ /app/backend

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN useradd -m -u 1000 omnidraft && chown -R omnidraft:omnidraft /app /var/log/nginx /var/lib/nginx

EXPOSE 8080

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER omnidraft
CMD ["/entrypoint.sh"]
```

## entrypoint.sh
```bash
#!/bin/sh
# Substitute environment variables in nginx config
envsubst '${ALLOWED_ORIGINS}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start FastAPI in background
cd /app/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 &

# Start Nginx in foreground
nginx -g 'daemon off;'
```

## Nginx Configuration
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 1000;
    gzip_vary on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend static files
    server {
        listen 8080;
        root /usr/share/nginx/html;
        index index.html;

        # API proxy
        location /api/ {
            proxy_pass http://127.0.0.1:8000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # SSE support (no buffering)
            proxy_buffering off;
            proxy_cache off;
            proxy_read_timeout 86400s;
        }

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## Docker Compose (Local Development)
```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public
    command: npm run dev -- --host 0.0.0.0
    depends_on:
      - backend
```

## Dockerfile.backend (Dev)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

## Dockerfile.frontend (Dev)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

## .dockerignore
```
node_modules/
__pycache__/
*.pyc
.env
.git
.gitignore
*.md
.vite/
dist/
```

## Health Check
```python
# In backend/app/main.py
@app.get("/api/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
```

## Build & Run Commands
```bash
# Production build
docker build -t omnidraft:latest -f docker/Dockerfile .

# Local dev
docker compose up --build

# Test locally
docker run -p 8080:8080 --env-file .env omnidraft:latest
```

---

INSTRUCTIONS:
Create all Docker files: multi-stage Dockerfile, Docker Compose for dev, Nginx config, entrypoint script, and .dockerignore. Ensure the Nginx config supports SSE (no buffering on /api/). Use non-root user. Ensure all environment variables are injectable at runtime (not baked into the image).

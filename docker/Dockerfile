FROM node:20-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM python:3.11-slim AS backend
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
RUN python -c "from app.main import app; print('Backend verified')"

FROM python:3.11-slim
RUN apt-get update && apt-get install -y nginx curl && \
    rm -rf /var/lib/apt/lists/* && \
    curl -sL https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared && \
    chmod +x /usr/local/bin/cloudflared

COPY --from=frontend /app/dist /usr/share/nginx/html
COPY --from=backend /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend /usr/local/bin/uvicorn /usr/local/bin/uvicorn
COPY --from=backend /app /app/backend
COPY docker/nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /var/cache/nginx && \
    useradd -m -u 1000 omnidraft && \
    chown -R omnidraft:omnidraft /app /var/log/nginx /var/lib/nginx /var/cache/nginx /run /usr/share/nginx/html

EXPOSE 8080
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
USER omnidraft
CMD ["/entrypoint.sh"]

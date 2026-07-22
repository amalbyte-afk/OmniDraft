#!/bin/sh

# Generate self-signed SSL certificate at startup
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/omnidraft.key \
  -out /etc/nginx/ssl/omnidraft.crt \
  -subj "/C=US/ST=NY/L=New York/O=OmniDraft/CN=localhost" \
  2>/dev/null

cd /app/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 &
nginx -g 'daemon off;'

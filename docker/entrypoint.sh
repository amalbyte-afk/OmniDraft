#!/bin/bash

set -o nounset

DOMAIN="omni-draft.duckdns.org"
EMAIL="amalchandran@outlook.com"
LETSENCRYPT_DIR="/etc/letsencrypt/live/$DOMAIN"

cd /app/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 &
UVICORN_PID=$!

nginx -c /etc/nginx/nginx.conf &
NGINX_PID=$!

sleep 2

(
  update_duckdns() {
    local token="${DUCK_TOKEN:-}"
    if [ -z "$token" ]; then
      echo "WARN: DUCK_TOKEN not set. Skipping DuckDNS update and HTTPS setup."
      return 1
    fi
    local public_ip
    public_ip=$(curl -fsS http://checkip.amazonaws.com 2>/dev/null)
    if [ -n "$public_ip" ]; then
      curl -fsS "https://www.duckdns.org/update?domains=omni-draft&token=${token}&ip=${public_ip}" > /dev/null 2>&1
      echo "INFO: DuckDNS updated to $public_ip"
    fi
  }

  wait_for_dns() {
    local expected_ip
    expected_ip=$(curl -fsS http://checkip.amazonaws.com 2>/dev/null)
    if [ -z "$expected_ip" ]; then
      echo "WARN: Cannot determine public IP"
      return 1
    fi
    for i in 1 2 3; do
      local resolved
      resolved=$(nslookup "$DOMAIN" 2>/dev/null | awk '/^Address: / {print $2}' | tail -1)
      if [ "$resolved" = "$expected_ip" ]; then
        return 0
      fi
      sleep 5
    done
    echo "WARN: DuckDNS not yet resolved to this instance. Proceeding anyway."
    return 0
  }

  setup_https() {
    local token="${DUCK_TOKEN:-}"
    if [ -z "$token" ]; then
      return 1
    fi

    update_duckdns || return 1
    wait_for_dns || true

    if [ ! -f "$LETSENCRYPT_DIR/fullchain.pem" ]; then
      certbot certonly --webroot -w /usr/share/nginx/html \
        -d "$DOMAIN" \
        --non-interactive --agree-tos --email "$EMAIL" 2>/dev/null
    fi

    if [ -f "$LETSENCRYPT_DIR/fullchain.pem" ]; then
      cat > /etc/nginx/nginx.conf << 'NGINXEOF'
pid /tmp/nginx.pid;
events { worker_connections 1024; }
http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
  gzip_min_length 1000;
  gzip_vary on;

  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  server {
    listen 8080;
    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl http2;
    server_name omni-draft.duckdns.org;

    ssl_certificate /etc/letsencrypt/live/omni-draft.duckdns.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/omni-draft.duckdns.org/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
      proxy_pass http://127.0.0.1:8000;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_buffering off;
      proxy_cache off;
      proxy_read_timeout 86400s;
    }

    location / {
      try_files $uri $uri/ /index.html;
    }

    location /assets/ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }
  }
}
NGINXEOF

      nginx -s reload 2>/dev/null
      echo "INFO: HTTPS enabled for $DOMAIN"
    fi
  }

  setup_https

  while true; do
    sleep 86400
    if [ -n "${DUCK_TOKEN:-}" ]; then
      certbot renew --webroot -w /usr/share/nginx/html --non-interactive --quiet 2>/dev/null && nginx -s reload 2>/dev/null
      update_duckdns
    fi
  done
) &
CERT_PID=$!

trap 'kill $UVICORN_PID $NGINX_PID $CERT_PID 2>/dev/null; exit' TERM INT

wait

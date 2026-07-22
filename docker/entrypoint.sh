#!/bin/sh

cd /app/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 &

nginx &

cloudflared tunnel --url http://localhost:8080 2>&1 | tee /tmp/cloudflared.log &

for i in $(seq 1 30); do
  url=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cloudflared.log 2>/dev/null | head -1)
  if [ -n "$url" ]; then
    echo "========================================"
    echo "CLOUDFLARE TUNNEL URL: $url"
    echo "========================================"
    echo "$url" > /usr/share/nginx/html/url.txt
    chmod 644 /usr/share/nginx/html/url.txt
    break
  fi
  sleep 2
done

wait

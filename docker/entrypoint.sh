#!/bin/sh
cd /app/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 &
nginx -g 'daemon off;'

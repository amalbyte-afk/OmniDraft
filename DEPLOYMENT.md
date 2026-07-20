# OmniDraft Deployment Guide

## Prerequisites
- AWS CLI configured with appropriate IAM permissions
- Docker installed
- Supabase project created (already done)

## Step 1: Initialize Database

Run the SQL migration in Supabase Dashboard:

1. Open https://supabase.com/dashboard/project/fegbaqkmjqxiphsndodk/sql/new
2. Copy contents of `backend/migrations/001_initial.sql`
3. Paste and execute (creates 4 tables, RLS policies, and seeds 12 templates)

This creates:
- `profiles` — user profiles linked to auth.users
- `conversations` — chat sessions with mode tracking
- `messages` — individual messages per conversation
- `templates` — 12 pre-built prompt templates (public, read-only)

## Step 2: Configure Supabase Auth

1. Go to Authentication → Settings
2. Enable **Email + Magic Link** provider
3. Set Site URL to your App Runner URL (or `http://localhost:5173` for dev)
4. Add redirect URLs: `https://your-app.awsapprunner.com/workspace`

## Step 3: Create Storage Bucket

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('uploads', 'uploads', false, 10485760, ARRAY['text/plain', 'application/pdf', 'application/msword']::text[]);
```

## Step 4: Build & Push Docker Image

```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create repository (first time only)
aws ecr create-repository --repository-name omnidraft --region us-east-1

# Build and push
docker build -t omnidraft:latest -f docker/Dockerfile .
docker tag omnidraft:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/omnidraft:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/omnidraft:latest
```

## Step 5: Deploy to AWS App Runner

Via Console:
1. Go to AWS App Runner → Create service
2. Source: Container registry → Amazon ECR
3. Select `omnidraft:latest`
4. Port: `8080`
5. CPU: 1 vCPU, Memory: 2 GB
6. Health check path: `/api/health`
7. Set environment variables:

| Variable | Value |
|---|---|
| SUPABASE_URL | `https://fegbaqkmjqxiphsndodk.supabase.co` |
| SUPABASE_SERVICE_KEY | (service_role key from .env) |
| NVIDIA_API_KEY | (NVIDIA API key from .env) |
| NVIDIA_MODEL | `z-ai/glm-5.2` |
| ALLOWED_ORIGINS | `https://<app-runner-url>.awsapprunner.com` |
| RATE_LIMIT | `20/minute` |
| MAX_TOKENS | `4096` |
| LOG_LEVEL | `INFO` |

8. Create and wait for deployment (2-3 minutes)

## Step 6: Verify Deployment

Check the health endpoint:
```bash
curl https://<your-app>.awsapprunner.com/api/health
```
Expected: `{"status":"healthy","timestamp":"..."}`

## Step 7: Local Development

```bash
# Start backend
cd backend
uvicorn app.main:app --reload --port 8000

# Start frontend (separate terminal)
npm run dev
```

## Architecture

```
Browser → Vite Dev (5173) / Nginx (8080 prod)
                        ↓
              FastAPI (8000)
                    ↓
        Supabase (Postgres + Auth)
                    ↓
           NVIDIA API (Nemotron)
```

## Notes
- No SSL needed on App Runner (terminated at load balancer)
- Frontend static files served by nginx, API proxied to uvicorn
- Rate limiting: 20 requests/minute per IP
- File uploads limited to 10MB, UTF-8 text only

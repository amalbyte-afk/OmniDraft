# OmniDraft Deployment Guide

## Architecture

```
                         ┌─────────────────────────────┐
                         │         DuckDNS             │
                         │  omni-draft.duckdns.org     │
                         └──────────────┬──────────────┘
                                        │ A record → EB public IP
                         ┌──────────────▼──────────────┐
                         │   AWS Elastic Beanstalk      │
                         │   Single-instance t3.micro   │
                         │   Docker AL2023 Platform     │
                         │                              │
                         │   ┌──────────────────────┐   │
                         │   │   Docker Container    │   │
                         │   │  ┌────────────────┐  │   │
                         │   │  │   Nginx (443)  │  │   │
                         │   │  │  (8080→301)    │  │   │
                         │   │  └───────┬────────┘  │   │
                         │   │          │            │   │
                         │   │  ┌───────▼────────┐  │   │
                         │   │  │   FastAPI      │  │   │
                         │   │  │   Uvicorn:8000 │  │   │
                         │   │  └────────────────┘  │   │
                         │   └──────────────────────┘   │
                         └──────────────────────────────┘
```

## Prerequisites

- AWS CLI configured with IAM permissions
- Docker installed
- Supabase project created (already done)
- DuckDNS domain: `omni-draft.duckdns.org`

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
3. Set **Site URL** to `https://omni-draft.duckdns.org`
4. Add to **Redirect URLs**: `https://omni-draft.duckdns.org`

## Step 3: Required Environment Variables

Set these in the Elastic Beanstalk environment (Environment Properties):

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `SUPABASE_ANON_KEY` | Supabase anon/publishable key |
| `NVIDIA_API_KEY` | NVIDIA LLM API key |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://omni-draft.duckdns.org` |
| `DUCK_TOKEN` | DuckDNS API token (for HTTPS automation) |

## Step 4: Build & Push Docker Image

```bash
# Authenticate to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 028417007474.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t omnidraft:latest -f docker/Dockerfile .
docker tag omnidraft:latest 028417007474.dkr.ecr.us-east-1.amazonaws.com/omnidraft:latest
docker push 028417007474.dkr.ecr.us-east-1.amazonaws.com/omnidraft:latest
```

## Step 5: Package & Deploy to Elastic Beanstalk

Both `Dockerrun.aws.json` and `.ebextensions/` must be packaged together:

```bash
# Create deployment zip (use forward slashes!)
cd OmniDraft
python -c "
import zipfile, os
with zipfile.ZipFile('eb-deploy.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    z.write('Dockerrun.aws.json', 'Dockerrun.aws.json')
    for root, dirs, files in os.walk('.ebextensions'):
        for f in files:
            path = os.path.join(root, f)
            z.write(path, path.replace(chr(92), '/'))
"

# Upload to S3
aws s3 cp eb-deploy.zip s3://elasticbeanstalk-us-east-1-028417007474/omnidraft/deploy.zip

# Create application version
aws elasticbeanstalk create-application-version \
  --application-name omnidraft \
  --version-label deploy-v1 \
  --source-bundle S3Bucket=elasticbeanstalk-us-east-1-028417007474,S3Key=omnidraft/deploy.zip

# Deploy
aws elasticbeanstalk update-environment \
  --environment-name omnidraft-prod \
  --version-label deploy-v1
```

## Step 6: Verify HTTPS

```bash
# Health check
curl https://omni-draft.duckdns.org/api/health

# Expected: {"status":"healthy","timestamp":"..."}

# Full page
curl -I https://omni-draft.duckdns.org
# Expected: 200 OK with Content-Security-Policy headers
```

## Step 7: Local Development

```bash
# Start backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Start frontend (separate terminal)
npm run dev
```

Or use Docker Compose:

```bash
docker compose -f docker-compose.dev.yml up
```

## Important: HTTPS Startup Flow

The container automatically provisions Let's Encrypt SSL at startup:

1. FastAPI + Nginx (HTTP) start immediately
2. Entrypoint updates DuckDNS A record with instance public IP
3. Waits briefly for DNS propagation
4. Runs Certbot HTTP-01 validation through port 80
5. On success, reloads Nginx with HTTPS (port 443) and HTTP→HTTPS redirect
6. Renewal checked every 24 hours via background loop

When `DUCK_TOKEN` is not set (e.g., local dev), the container serves HTTP on port 8080 only and logs a safe warning. No cert is requested.

## Cleanup After Assessment

```bash
# Terminate Elastic Beanstalk environment
aws elasticbeanstalk terminate-environment --environment-name omnidraft-prod

# Delete ECR repository
aws ecr delete-repository --repository-name omnidraft --force

# Delete DuckDNS record (optional)
# Visit https://duckdns.org and remove the domain
```

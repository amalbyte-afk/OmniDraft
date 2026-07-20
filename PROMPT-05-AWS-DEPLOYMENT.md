# Prompt 5: AWS Deployment — OmniDraft

## Vibe Profile
**Role**: Cloud Architect + DevOps Engineer
**Platform**: AWS App Runner (fully managed container deployment)

## Product Brief
Deploy the containerized OmniDraft application to AWS App Runner. Configure environment variables, secrets, IAM permissions, cost alerts, and verify the live HTTPS URL is working end-to-end.

## Project Goals
- Push Docker image to Amazon ECR (Elastic Container Registry)
- Create App Runner service from ECR image
- Configure all environment variables in App Runner (not in the image)
- Verify SSE streaming works over HTTPS
- Verify CORS allows the App Runner URL
- Set up AWS Budget alerts ($5/month max)
- Create deployment documentation for the project report

## Tech Stack
- AWS App Runner (compute)
- Amazon ECR (container registry)
- AWS IAM (deployment user)
- AWS Budgets (cost control)
- GitHub (source code, not connected directly to App Runner)

## Step-by-Step Deployment

### Prerequisites
```bash
# 1. Install AWS CLI
# 2. Create IAM user "omnidraft-deployer" with:
#    - AmazonAppRunnerFullAccess
#    - AmazonEC2ContainerRegistryFullAccess
#    - IAMPassRole
# 3. Configure AWS CLI
aws configure
# Access Key: xxx
# Secret Key: xxx
# Region: us-east-1 (or nearest)
```

### Step 1: Authenticate Docker to ECR
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

### Step 2: Create ECR Repository
```bash
aws ecr create-repository --repository-name omnidraft --region us-east-1
```

### Step 3: Build & Push Docker Image
```bash
docker build -t omnidraft:latest -f docker/Dockerfile .
docker tag omnidraft:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/omnidraft:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/omnidraft:latest
```

### Step 4: Create App Runner Service
```bash
# Option A: Via AWS Console
# 1. Go to AWS App Runner
# 2. Create service → Container registry → ECR
# 3. Select omnidraft:latest
# 4. Deployment: Manual (or automatic on push)
# 5. Service settings:
#    - CPU: 1 vCPU
#    - Memory: 2 GB
#    - Port: 8080
# 6. Environment variables (see below)
# 7. Create

# Option B: Via AWS CLI (apprunner.json)
aws apprunner create-service --cli-input-json file://apprunner.json
```

### Step 5: Configure Environment Variables in App Runner Console
| Variable | Value | Secret |
|----------|-------|--------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | No |
| `SUPABASE_SERVICE_KEY` | `service_role_key` | **Yes** |
| `NVIDIA_API_KEY` | `nvapi-xxxxxxxxxxxxxxxx` | **Yes** |
| `ALLOWED_ORIGINS` | `https://your-app.awsapprunner.com` | No |
| `RATE_LIMIT` | `20/minute` | No |
| `MAX_TOKENS` | `4096` | No |
| `LOG_LEVEL` | `INFO` | No |

### Step 6: Wait for Deployment
- App Runner builds, provisions, and deploys automatically
- Status: "Running" with a URL like `https://xxxxxxxxxx.awsapprunner.com`
- This takes 3-5 minutes on first deploy

### Step 7: Verify Deployment
```bash
# Health check
curl https://your-app.awsapprunner.com/api/health

# Should return: {"status": "healthy", "timestamp": "..."}

# Check frontend loads
curl -s https://your-app.awsapprunner.com | head -20
# Should contain HTML with "OmniDraft" in it

# Verify CORS
curl -H "Origin: https://your-app.awsapprunner.com" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  https://your-app.awsapprunner.com/api/health
# Should return: Access-Control-Allow-Origin: https://your-app.awsapprunner.com
```

### Step 8: Set Up Cost Alerts
```bash
# In AWS Console:
# 1. Billing → Budgets → Create budget
# 2. Type: Cost budget
# 3. Amount: $5
# 4. Email alert thresholds: 50%, 80%, 100%
# 5. Create
```

## apprunner.json (CLI Deployment)
```json
{
  "ServiceName": "omnidraft",
  "SourceConfiguration": {
    "AuthenticationConfiguration": {
      "AccessRoleArn": "arn:aws:iam::<account-id>:role/AppRunnerECRAccessRole"
    },
    "ImageRepository": {
      "ImageIdentifier": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/omnidraft:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "8080",
        "RuntimeEnvironmentVariables": {
          "SUPABASE_URL": "",
          "ALLOWED_ORIGINS": "",
          "RATE_LIMIT": "20/minute",
          "MAX_TOKENS": "4096",
          "LOG_LEVEL": "INFO"
        },
        "RuntimeEnvironmentSecrets": {
          "SUPABASE_SERVICE_KEY": "supabase-service-key",
          "NVIDIA_API_KEY": "nvidia-api-key"
        }
      }
    }
  },
  "InstanceConfiguration": {
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  },
  "HealthCheckConfiguration": {
    "Path": "/api/health",
    "Interval": 10,
    "Timeout": 5,
    "HealthyThreshold": 2,
    "UnhealthyThreshold": 5
  }
}
```

## IAM Policy for Deployer User
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "apprunner:*",
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart",
        "iam:PassRole"
      ],
      "Resource": "*"
    }
  ]
}
```

## Production Checklist
- [ ] HTTPS URL works (automatic with App Runner)
- [ ] Frontend loads without errors (check browser console)
- [ ] User can sign up / sign in (Supabase Auth)
- [ ] Chat streaming works over SSE
- [ ] Copy-to-clipboard works
- [ ] Export as TXT and MD works
- [ ] File upload works in Summarize mode
- [ ] CORS headers correct for production URL
- [ ] Rate limiting returns 429 after 20 requests/min
- [ ] No API keys exposed in frontend code
- [ ] AWS Budget alert configured ($5)
- [ ] App Runner auto-scaling configured (min 1, max 2)
- [ ] Health check endpoint returns 200
- [ ] Tested on mobile (375px viewport)

## Troubleshooting
| Problem | Fix |
|---------|-----|
| App Runner fails to start | Check CloudWatch logs for startup errors |
| CORS errors | Verify ALLOWED_ORIGINS includes the exact App Runner URL |
| SSE not streaming | Check nginx proxy_buffering is OFF |
| Database connection failed | Verify SUPABASE_URL and SUPABASE_SERVICE_KEY |
| 429 Too Many Requests | Wait 1 minute or check RATE_LIMIT env var |
| Image too large | Reduce image size (use --slim base images) |

---

INSTRUCTIONS:
Generate a complete deployment guide for AWS App Runner. Include all CLI commands, IAM policies, environment variable configuration, cost alerts setup, and a production verification checklist. Ensure the guide references the course requirement for live AWS deployment with a public HTTPS URL.

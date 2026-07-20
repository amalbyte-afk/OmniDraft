#!/bin/bash
set -e

# Configuration — UPDATE THESE
AWS_ACCOUNT_ID="your-account-id"
AWS_REGION="us-east-1"
REPO_NAME="omnidraft"
SERVICE_NAME="omnidraft"

# Authenticate
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Create ECR repo if needed
aws ecr create-repository --repository-name $REPO_NAME --region $AWS_REGION 2>/dev/null || true

# Build and push
docker build -t $REPO_NAME:latest -f docker/Dockerfile .
docker tag $REPO_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME:latest

echo "Image pushed. Now create App Runner service via AWS Console:"
echo "1. Go to AWS App Runner → Create service → Container registry → ECR"
echo "2. Select $REPO_NAME:latest"
echo "3. Port: 8080"
echo "4. CPU: 1 vCPU, Memory: 2 GB"
echo "5. Set environment variables (see .env.example)"
echo "6. Health check path: /api/health"
echo "7. Create and wait for deployment"

#!/bin/bash

set -e

echo "🚀 Deploying ILS Application..."

# Load environment variables
source .env.production

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t ils-app:latest .

# Tag for registry
docker tag ils-app:latest $DOCKER_REGISTRY/ils-app:latest
docker tag ils-app:latest $DOCKER_REGISTRY/ils-app:$BUILD_VERSION

# Push to registry
echo "📤 Pushing to Docker registry..."
docker push $DOCKER_REGISTRY/ils-app:latest
docker push $DOCKER_REGISTRY/ils-app:$BUILD_VERSION

# Deploy to Kubernetes
echo "☸️  Deploying to Kubernetes..."
envsubst < kubernetes/deployment.yaml | kubectl apply -f -
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/ingress.yaml

# Wait for rollout
echo "⏳ Waiting for deployment rollout..."
kubectl rollout status deployment/ils-app

# Run health checks
echo "🏥 Running health checks..."
kubectl wait --for=condition=available --timeout=300s deployment/ils-app

echo "✅ Deployment completed successfully!"

# Send deployment notification
curl -X POST "$SLACK_WEBHOOK_URL" \
  -H 'Content-type: application/json' \
  --data "{\"text\":\"ILS App deployed successfully to production! Version: $BUILD_VERSION\"}"

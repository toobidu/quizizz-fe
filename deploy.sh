#!/bin/bash

echo "🚀 Deploying Quizizz Frontend..."

# Stop and remove old container
echo "📦 Stopping old container..."
docker-compose down

# Build new image
echo "🔨 Building new image..."
docker-compose build --no-cache

# Start new container
echo "▶️  Starting new container..."
docker-compose up -d

# Show logs
echo "📋 Container logs:"
docker-compose logs -f

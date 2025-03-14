#!/bin/bash

# Script to rebuild the application with updated dependencies

echo "Stopping existing containers..."
docker-compose down

echo "Removing node_modules volumes..."
docker volume rm avocadoair_api_node_modules avocadoair_frontend_node_modules 2>/dev/null || true

echo "Rebuilding and starting containers with updated dependencies..."
docker-compose -f docker-compose.rebuild.yml up --build -d

echo "Waiting for services to start..."
sleep 10

echo "Checking API status..."
curl -s http://localhost:6060/api/health || echo "API not responding yet. It may take a few more moments to start."

echo "Checking Frontend status..."
curl -s -I http://localhost:8080 || echo "Frontend not responding yet. It may take a few more moments to start."

echo "Rebuild process completed!"
echo "You can now access the application at:"
echo "- Frontend: http://localhost:8080"
echo "- API: http://localhost:6060"
echo "- API Documentation: http://localhost:6060/api/docs" 
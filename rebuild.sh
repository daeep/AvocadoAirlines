#!/bin/bash

# This script rebuilds the entire AvocadoAir application from scratch
# It stops all containers, removes volumes, and rebuilds everything

# Function to check if database is accessible
check_db_connection() {
  echo "Checking database connection..."
  if docker-compose exec -T avocadoair-db pg_isready -U avocadoair_user -d avocadoair > /dev/null 2>&1; then
    echo "Database is accessible!"
    return 0
  else
    echo "Database is not yet accessible."
    return 1
  fi
}

echo "Rebuilding AvocadoAir application from scratch..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running or not accessible"
  exit 1
fi

# Stop all containers
echo "Stopping all containers..."
docker-compose down

# Remove volumes
echo "Removing volumes..."
docker volume rm avocadoair_postgres_data || true

# Rebuild and start containers
echo "Rebuilding and starting containers..."
docker-compose up -d --build

# Wait for database to be ready (with timeout)
echo "Waiting for database to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if docker-compose ps | grep -q "avocadoair-db.*Up"; then
    echo "Database container is up!"
    break
  fi
  
  echo "Waiting for database container to start... ($(($RETRY_COUNT + 1))/$MAX_RETRIES)"
  sleep 2
  RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "Error: Database container failed to start within the timeout period"
  echo "Checking database container logs:"
  docker-compose logs avocadoair-db
  
  echo "Attempting to restart the database container..."
  docker-compose restart avocadoair-db
  sleep 10
fi

# Check if database is healthy
echo "Checking database health..."
if ! docker-compose ps | grep -q "avocadoair-db.*Up"; then
  echo "Error: Database container is not running. Check the logs for more information:"
  docker-compose logs avocadoair-db
  
  echo "You may need to check your Docker configuration or environment variables."
  echo "Continuing with the rest of the setup, but the application may not work correctly."
else
  echo "Database container is running."
  
  # Wait for database to be ready for connections
  echo "Waiting for database to accept connections..."
  MAX_DB_RETRIES=15
  DB_RETRY_COUNT=0
  
  while [ $DB_RETRY_COUNT -lt $MAX_DB_RETRIES ]; do
    if check_db_connection; then
      break
    fi
    
    echo "Waiting for database to be ready... ($(($DB_RETRY_COUNT + 1))/$MAX_DB_RETRIES)"
    sleep 2
    DB_RETRY_COUNT=$((DB_RETRY_COUNT + 1))
  done
  
  if [ $DB_RETRY_COUNT -eq $MAX_DB_RETRIES ]; then
    echo "Warning: Database is not responding within the timeout period."
    echo "Will attempt to run initialization scripts anyway."
  fi
  
  # Run database initialization scripts
  echo "Running database initialization scripts..."
  if ! docker-compose exec -T avocadoair-db psql -U avocadoair_user -d avocadoair -f /docker-entrypoint-initdb.d/init.sql; then
    echo "Warning: Initialization script encountered errors but will continue."
  fi
  
  if ! docker-compose exec -T avocadoair-db psql -U avocadoair_user -d avocadoair -f /docker-entrypoint-initdb.d/update.sql; then
    echo "Warning: Update script encountered errors but will continue."
  fi
fi

# Restart API container
echo "Restarting API container..."
docker-compose restart avocadoair-api

# Check if all containers are running
echo "Checking application status..."
if docker-compose ps | grep -q "Exit"; then
  echo "Warning: Some containers have exited. Check the logs for more information:"
  docker-compose ps
else
  echo "All containers are running!"
fi

echo "Done! The application has been rebuilt from scratch."
echo "Frontend: http://localhost:8080"
echo "API: http://localhost:6060"
echo ""
echo "If you encounter any issues, check the container logs with:"
echo "docker-compose logs avocadoair-db"
echo "docker-compose logs avocadoair-api"
echo "docker-compose logs avocadoair-frontend" 
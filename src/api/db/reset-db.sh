#!/bin/bash

# This script resets the database to its initial state
# It should be run from the project root directory

# Function to check if database is accessible
check_db_connection() {
  echo "Checking database connection..."
  if docker-compose exec -T avocadoair-db pg_isready -U $DB_USER -d $DB_NAME > /dev/null 2>&1; then
    echo "Database is accessible!"
    return 0
  else
    echo "Database is not yet accessible."
    return 1
  fi
}

echo "Resetting AvocadoAir database..."

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "Loaded environment variables from .env file"
else
  echo "Warning: .env file not found, using default values"
  export DB_USER=avocadoair_user
  export DB_PASSWORD=avocadoair_password
  export DB_NAME=avocadoair
  export DB_PORT=5432
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running or not accessible"
  exit 1
fi

# Check if the database container is running
if ! docker-compose ps | grep -q "avocadoair-db.*Up"; then
  echo "Error: Database container is not running"
  echo "Starting containers..."
  docker-compose up -d
  
  # Wait for database to be ready
  echo "Waiting for database to be ready..."
  MAX_RETRIES=15
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
    echo "Please check the logs with: docker-compose logs avocadoair-db"
    exit 1
  fi
  
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
    echo "Will attempt to continue anyway."
  fi
else
  # Check if database is accessible
  MAX_DB_RETRIES=5
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
    echo "Will attempt to continue anyway."
  fi
fi

echo "Dropping and recreating database..."

# Drop and recreate the database
if ! docker-compose exec -T avocadoair-db psql -U $DB_USER -c "
DROP DATABASE IF EXISTS ${DB_NAME}_temp;
CREATE DATABASE ${DB_NAME}_temp;
"; then
  echo "Error: Failed to create temporary database"
  echo "Please check if the database container is healthy and the credentials are correct"
  exit 1
fi

# Connect to the temporary database and run the initialization scripts
echo "Running initialization scripts..."
if ! docker-compose exec -T avocadoair-db psql -U $DB_USER -d ${DB_NAME}_temp -f /docker-entrypoint-initdb.d/init.sql; then
  echo "Warning: Initialization script (init.sql) encountered errors but will continue"
fi

if ! docker-compose exec -T avocadoair-db psql -U $DB_USER -d ${DB_NAME}_temp -f /docker-entrypoint-initdb.d/update.sql; then
  echo "Warning: Update script (update.sql) encountered errors but will continue"
fi

# Switch databases
echo "Switching databases..."
if ! docker-compose exec -T avocadoair-db psql -U $DB_USER -c "
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}';
DROP DATABASE IF EXISTS ${DB_NAME};
ALTER DATABASE ${DB_NAME}_temp RENAME TO ${DB_NAME};
"; then
  echo "Error: Failed to switch databases"
  echo "The temporary database ${DB_NAME}_temp may still exist"
  exit 1
fi

echo "Database reset complete!"
echo "Restarting API container..."
docker-compose restart avocadoair-api

echo "Done! The database has been reset to its initial state."
echo ""
echo "You can now access the application at:"
echo "Frontend: http://localhost:8080"
echo "API: http://localhost:6060" 
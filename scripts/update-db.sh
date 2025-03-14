#!/bin/bash

# Script to update the database schema

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

echo "Updating database schema..."

# Run the update script
docker exec -i webtours-db psql -U $DB_USER -d $DB_NAME < src/api/db/update.sql

echo "Database update completed."

# Restart the API container to apply changes
echo "Restarting API container..."
docker restart webtours-api

echo "Done!" 
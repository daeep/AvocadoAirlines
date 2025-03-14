# AvocadoAir Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Troubleshooting](#troubleshooting)

## API Documentation

The API documentation is available through Swagger UI at:
```
http://localhost:6060/api/docs
```

This interactive documentation provides:
- Detailed API endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Interactive API testing interface

### Rebuilding the Application

To rebuild the application and restart all containers (including the database), use the rebuild script:

```bash
./rebuild.sh
```

This script will:
1. Stop all running containers
2. Remove existing containers and volumes
3. Rebuild all containers
4. Start the application fresh

This is particularly useful when:
- Making changes to the database schema
- Updating environment variables
- Troubleshooting container issues
- Ensuring a clean state for development 
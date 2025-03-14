# AvocadoAirlines

AvocadoAirlines is a modern, full-stack web application for airline reservations and flight management. The application allows users to search for flights, make reservations, manage their bookings, and access information about the airline.

## Architecture

The application follows a microservices architecture with the following components:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Vue.js         │     │  Node.js        │     │  PostgreSQL     │
│  Frontend       │────▶│  API Server     │────▶│  Database       │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                       │
        │                        │                       │
        ▼                        ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      Docker Containers                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Components

1. **Frontend (Vue.js)**
   - Single-page application built with Vue.js
   - Responsive design for desktop and mobile devices
   - Internationalization support for multiple languages
   - State management with Vuex

2. **API Server (Node.js)**
   - RESTful API built with Express.js
   - JWT authentication
   - Flight and reservation management
   - User profile management

3. **Database (PostgreSQL)**
   - Stores user data, flight information, and reservations
   - Optimized for performance and reliability

4. **Docker**
   - Containerization for easy deployment and scaling
   - Docker Compose for local development and testing

## Features

- **User Authentication**: Secure login and registration system
- **Flight Search**: Search for flights by origin, destination, and date
- **Booking Management**: Create, view, and manage flight reservations
- **Multilingual Support**: Interface available in multiple languages
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **User Profiles**: Manage personal information and preferences

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- npm or yarn (for local development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/AvocadoAirlines.git
   cd AvocadoAirlines
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:8080
   - API: http://localhost:3000

### Development

For local development without Docker:

1. Start the API server:
   ```bash
   cd src/api
   npm install
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd src/frontend
   npm install
   npm run serve
   ```

## Project Structure

```
AvocadoAirlines/
├── db/                  # Database initialization scripts
├── docker/              # Docker configuration files
├── scripts/             # Utility scripts
├── src/
│   ├── api/             # Backend API server
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   ├── utils/       # Utility functions
│   │   └── server.js    # Main server file
│   └── frontend/        # Vue.js frontend
│       ├── public/      # Static assets
│       └── src/         # Source code
│           ├── assets/  # Images and styles
│           ├── components/ # Vue components
│           ├── i18n/    # Internationalization
│           ├── router/  # Vue Router configuration
│           ├── store/   # Vuex store
│           ├── views/   # Page components
│           └── App.vue  # Root component
└── docker-compose.yml   # Docker Compose configuration
```

## Technologies Used

- **Frontend**:
  - Vue.js
  - Vuex
  - Vue Router
  - Vue I18n
  - Axios

- **Backend**:
  - Node.js
  - Express.js
  - JWT Authentication
  - PostgreSQL
  - Sequelize ORM

- **DevOps**:
  - Docker
  - Docker Compose
  - Git

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
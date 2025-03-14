const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('./utils/passport');
const logger = require('./utils/logger');
const swagger = require('./utils/swagger');
const db = require('./utils/db');
const authRoutes = require('./routes/auth.routes');
const flightsRoutes = require('./routes/flights.routes');
const reservationsRoutes = require('./routes/reservations.routes');
const healthRoutes = require('./routes/health.routes');
const itinerariesRoutes = require('./routes/itineraries.routes');
const airportsRoutes = require('./routes/airports.routes');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.VUE_APP_URL || 'http://localhost:8080';

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' }
);

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP in development
  crossOriginEmbedderPolicy: false, // Disable COEP in development
  crossOriginOpenerPolicy: false, // Disable COOP in development
  crossOriginResourcePolicy: false, // Disable CORP in development
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:6060',
    FRONTEND_URL,
    'http://avocadoair-frontend:8080'
  ].filter(Boolean), // Remove any undefined values
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600,
  preflightContinue: false
}));

// Add CORS logging middleware
app.use((req, res, next) => {
  logger.debug('CORS Request:', {
    origin: req.headers.origin,
    method: req.method,
    path: req.path,
    headers: req.headers
  });
  next();
});

// Session configuration
app.use(session({
  store: new pgSession({
    pool: db.pool,
    tableName: 'user_sessions'
  }),
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API documentation
app.use('/api/docs', swagger.serve, swagger.setup);

// Routes
app.use('/api/flights', flightsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/itineraries', itinerariesRoutes);
app.use('/api/airports', airportsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { 
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      status: err.status || 500
    }
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Frontend URL: ${FRONTEND_URL}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app; // For testing 
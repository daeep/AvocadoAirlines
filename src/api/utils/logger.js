const winston = require('winston');
const { format } = winston;

// Define log format
const logFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  format.errors({ stack: true }),
  format.json()
);

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.colorize(),
    format.simple()
  ),
  defaultMeta: { service: 'avocadoair-api' },
  transports: [
    new winston.transports.Console()
  ]
});

module.exports = logger; 
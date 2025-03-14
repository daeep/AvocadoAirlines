const { Pool } = require('pg');
const logger = require('./logger');

// Parse DATABASE_URL if provided, otherwise use individual parameters
let poolConfig;

if (process.env.DATABASE_URL) {
  // Use the connection URL directly
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    // Add SSL configuration if needed
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
} else {
  // Use individual connection parameters 
  poolConfig = {
    host: process.env.DB_HOST || 'avocadoair-db',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'avocadoair',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    // Add connection timeout and retry settings
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 20, // Maximum number of clients in the pool
  };
}

// Create a PostgreSQL connection pool
const pool = new Pool(poolConfig);

// Function to test database connection with retries
const testConnection = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pool.query('SELECT NOW()');
      logger.info('Database connected successfully');
      return true;
    } catch (err) {
      logger.error(`Database connection attempt ${i + 1} failed`, { 
        error: err.message,
        attempt: i + 1,
        maxAttempts: retries
      });
      
      if (i < retries - 1) {
        logger.info(`Retrying connection in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        logger.error('Failed to connect to database after all retries');
        throw err;
      }
    }
  }
};

// Test the connection with retries
testConnection().catch(err => {
  logger.error('Fatal: Could not establish database connection', { error: err.message });
  process.exit(1);
});

// Export query method and pool for transactions
module.exports = {
  query: (text, params) => {
    const start = Date.now();
    return pool.query(text, params)
      .then(res => {
        const duration = Date.now() - start;
        logger.debug('Executed query', { 
          query: text, 
          duration, 
          rows: res.rowCount 
        });
        return res;
      })
      .catch(err => {
        logger.error('Query error', { 
          error: err.message,
          query: text
        });
        throw err;
      });
  },
  pool
}; 
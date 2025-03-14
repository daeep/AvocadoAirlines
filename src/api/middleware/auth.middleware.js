const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const db = require('../utils/db');

/**
 * Middleware to authenticate JWT tokens and validate sessions
 */
async function authMiddleware(req, res, next) {
  try {
    // First check for session cookie
    if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
    }

    // If no session, check for JWT token
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Get token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    // Add user from payload to request
    req.user = decoded.user;

    // Try to check if session is valid in database, but don't block if not found
    try {
      const session = await db.query(
        'SELECT * FROM user_sessions WHERE token = $1 AND expires_at > NOW()',
        [token]
      );

      // If session exists, update last used timestamp
      if (session.rows.length > 0) {
        await db.query(
          'UPDATE user_sessions SET last_used_at = NOW() WHERE token = $1',
          [token]
        );
      } else {
        // Session not found, but token is valid - create a new session
        logger.info('Valid token without session record, creating session', { userId: decoded.user.id });
        
        // Calculate expiration date (24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        // Store session in database
        await db.query(
          `INSERT INTO user_sessions 
           (user_id, token, ip_address, user_agent, expires_at) 
           VALUES ($1, $2, $3, $4, $5)`,
          [decoded.user.id, token, req.ip, req.headers['user-agent'], expiresAt]
        );
      }
    } catch (dbErr) {
      // Log error but continue with request
      logger.error('Session validation error', { error: dbErr.message });
    }

    next();
  } catch (err) {
    logger.error('Token verification failed', { error: err.message });
    res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = authMiddleware; 
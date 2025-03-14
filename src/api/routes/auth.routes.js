const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const passport = require('../utils/passport');
const db = require('../utils/db');
const logger = require('../utils/logger');
const authMiddleware = require('../middleware/auth.middleware');
const twoFactorAuth = require('../utils/twoFactorAuth');
const email = require('../utils/email');
const { RateLimiterPostgres } = require('rate-limiter-flexible');

// Setup rate limiter
const rateLimiter = new RateLimiterPostgres({
  storeClient: db.pool,
  tableName: 'rate_limits',
  points: 5, // Number of points
  duration: 60 * 15, // Per 15 minutes
});

// Rate limiter middleware
async function rateLimitMiddleware(req, res, next) {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (err) {
    res.status(429).json({ message: 'Too many requests, please try again later.' });
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The username for login
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the user
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date of user creation
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 */
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, firstName, lastName } = req.body;

    try {
      const userCheck = await db.query(
        'SELECT * FROM users WHERE username = $1 OR email = $2',
        [username, email]
      );

      if (userCheck.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const result = await db.query(
        'INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, first_name, last_name',
        [username, email, hashedPassword, firstName, lastName]
      );

      const user = result.rows[0];
      const token = jwt.sign(
        { user: { id: user.id, username: user.username } },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user and get token
 *     description: |
 *       Authenticates a user with their username and password.
 *       Returns a JWT token that can be used for authenticated requests.
 *       The token expires after 24 hours.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 description: User's password
 *                 format: password
 *                 minLength: 8
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: User ID
 *                       example: 1
 *                     username:
 *                       type: string
 *                       description: User's username
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email address
 *                       example: john.doe@example.com
 *                     firstName:
 *                       type: string
 *                       description: User's first name
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       description: User's last name
 *                       example: Doe
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Too many requests, please try again later.
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Validation errors in login request', { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      logger.info('Login attempt details', { 
        username,
        requestHeaders: req.headers,
        timestamp: new Date().toISOString()
      });
      
      const result = await db.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      logger.info('Database query result', { 
        username,
        userFound: result.rows.length > 0,
        timestamp: new Date().toISOString()
      });

      if (result.rows.length === 0) {
        logger.warn('Login failed - user not found', { username });
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = result.rows[0];
      
      logger.debug('Password comparison', { 
        userId: user.id,
        username: user.username,
        hasPasswordHash: !!user.password_hash,
        passwordHashLength: user.password_hash ? user.password_hash.length : 0,
        providedPasswordLength: password ? password.length : 0,
        timestamp: new Date().toISOString()
      });
      
      const isMatch = await bcrypt.compare(password, user.password_hash);

      logger.info('Password verification result', { 
        userId: user.id,
        username: user.username,
        isMatch,
        timestamp: new Date().toISOString()
      });

      if (!isMatch) {
        logger.warn('Login failed - password mismatch', { 
          username,
          providedPasswordLength: password.length,
          storedHashLength: user.password_hash.length
        });
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      logger.info('Login successful, generating token', { userId: user.id });
      
      const token = jwt.sign(
        { user: { id: user.id, username: user.username } },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '24h' }
      );
      
      // Store session in database
      try {
        // Calculate expiration date (24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        // Store session in database
        await db.query(
          `INSERT INTO user_sessions 
           (user_id, token, ip_address, user_agent, expires_at) 
           VALUES ($1, $2, $3, $4, $5)`,
          [user.id, token, req.ip, req.headers['user-agent'], expiresAt]
        );
        
        logger.info('Session stored in database', { userId: user.id });
      } catch (sessionErr) {
        logger.error('Failed to store session', { error: sessionErr.message });
        // Continue even if session storage fails
      }

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        }
      });
    } catch (err) {
      logger.error('Login error', { 
        error: err.message,
        stack: err.stack,
        username,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

/**
 * @swagger
 * /auth/2fa/enable:
 *   post:
 *     summary: Enable 2FA for user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.post('/2fa/enable', authMiddleware, async (req, res) => {
  try {
    const user = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [req.user.id]
    );

    const { secret, qrCode } = await twoFactorAuth.generateSecret(user.rows[0].username);
    
    res.json({
      secret,
      qrCode,
      message: 'Scan the QR code with your authenticator app and verify with a token'
    });
  } catch (err) {
    logger.error('2FA enable error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /auth/2fa/verify:
 *   post:
 *     summary: Verify and activate 2FA
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/2fa/verify',
  authMiddleware,
  [body('token').notEmpty().withMessage('Token is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, secret } = req.body;

    try {
      const isValid = twoFactorAuth.verifyToken(secret, token);
      if (!isValid) {
        return res.status(400).json({ message: 'Invalid token' });
      }

      const { backupCodes } = await twoFactorAuth.enable2FA(req.user.id, secret);

      // Send email notification
      const user = await db.query(
        'SELECT email FROM users WHERE id = $1',
        [req.user.id]
      );
      await email.send2FAEnabledEmail(user.rows[0].email);

      res.json({
        message: '2FA enabled successfully',
        backupCodes
      });
    } catch (err) {
      logger.error('2FA verification error', { error: err.message });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /auth/2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.post('/2fa/disable', authMiddleware, async (req, res) => {
  try {
    await twoFactorAuth.disable2FA(req.user.id);
    res.json({ message: '2FA disabled successfully' });
  } catch (err) {
    logger.error('2FA disable error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     security: []
 */
router.post(
  '/forgot-password',
  rateLimitMiddleware,
  [body('email').isEmail().withMessage('Please include a valid email')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email: userEmail } = req.body;

      const user = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [userEmail]
      );

      if (user.rows.length === 0) {
        return res.status(200).json({ message: 'If an account exists, a password reset email will be sent' });
      }

      const token = jwt.sign(
        { user: { id: user.rows[0].id } },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '1h' }
      );

      await db.query(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'1 hour\')',
        [user.rows[0].id, token]
      );

      await email.sendPasswordResetEmail(userEmail, token);

      res.json({ message: 'If an account exists, a password reset email will be sent' });
    } catch (err) {
      logger.error('Forgot password error', { error: err.message });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     security: []
 */
router.post(
  '/reset-password',
  rateLimitMiddleware,
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    try {
      const resetToken = await db.query(
        'SELECT * FROM password_reset_tokens WHERE token = $1 AND is_used = false AND expires_at > NOW()',
        [token]
      );

      if (resetToken.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await db.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [hashedPassword, resetToken.rows[0].user_id]
      );

      await db.query(
        'UPDATE password_reset_tokens SET is_used = true WHERE token = $1',
        [token]
      );

      // Invalidate all sessions for this user
      await db.query(
        'UPDATE user_sessions SET is_valid = false WHERE user_id = $1',
        [resetToken.rows[0].user_id]
      );

      res.json({ message: 'Password reset successful' });
    } catch (err) {
      logger.error('Password reset error', { error: err.message });
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    
    await db.query(
      'UPDATE user_sessions SET is_valid = false WHERE token = $1',
      [token]
    );

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    logger.error('Logout error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
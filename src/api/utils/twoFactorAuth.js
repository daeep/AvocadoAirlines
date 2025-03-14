const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const db = require('./db');
const logger = require('./logger');

/**
 * Generate a new secret for 2FA
 * @param {string} username - The username to generate the secret for
 * @returns {Object} Object containing secret and QR code data URL
 */
async function generateSecret(username) {
  try {
    const secret = speakeasy.generateSecret({
      name: `WebTours:${username}`
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl
    };
  } catch (err) {
    logger.error('2FA secret generation error', { error: err.message });
    throw err;
  }
}

/**
 * Verify a 2FA token
 * @param {string} secret - The user's 2FA secret
 * @param {string} token - The token to verify
 * @returns {boolean} Whether the token is valid
 */
function verifyToken(secret, token) {
  try {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 30 seconds clock skew
    });
  } catch (err) {
    logger.error('2FA token verification error', { error: err.message });
    return false;
  }
}

/**
 * Generate backup codes for a user
 * @param {number} count - Number of backup codes to generate
 * @returns {string[]} Array of backup codes
 */
function generateBackupCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate 8 character backup code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Enable 2FA for a user
 * @param {number} userId - The user's ID
 * @param {string} secret - The 2FA secret
 * @returns {Object} Object containing backup codes
 */
async function enable2FA(userId, secret) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Store 2FA data
    await client.query(
      'INSERT INTO two_factor_auth (user_id, secret, backup_codes, is_enabled) VALUES ($1, $2, $3, true)',
      [userId, secret, backupCodes]
    );

    await client.query('COMMIT');
    return { backupCodes };
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('2FA enable error', { error: err.message });
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Disable 2FA for a user
 * @param {number} userId - The user's ID
 */
async function disable2FA(userId) {
  try {
    await db.query(
      'DELETE FROM two_factor_auth WHERE user_id = $1',
      [userId]
    );
  } catch (err) {
    logger.error('2FA disable error', { error: err.message });
    throw err;
  }
}

/**
 * Verify a backup code for a user
 * @param {number} userId - The user's ID
 * @param {string} code - The backup code to verify
 * @returns {boolean} Whether the code is valid
 */
async function verifyBackupCode(userId, code) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Get user's backup codes
    const result = await client.query(
      'SELECT backup_codes FROM two_factor_auth WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    const backupCodes = result.rows[0].backup_codes;
    const codeIndex = backupCodes.indexOf(code);

    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1);

    // Update backup codes
    await client.query(
      'UPDATE two_factor_auth SET backup_codes = $1 WHERE user_id = $2',
      [backupCodes, userId]
    );

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Backup code verification error', { error: err.message });
    return false;
  } finally {
    client.release();
  }
}

module.exports = {
  generateSecret,
  verifyToken,
  generateBackupCodes,
  enable2FA,
  disable2FA,
  verifyBackupCode
}; 
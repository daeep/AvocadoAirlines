const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} token - Password reset token
 * @returns {Promise} Nodemailer send mail promise
 */
async function sendPasswordResetEmail(to, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"WebTours Support" <${process.env.SMTP_FROM}>`,
    to,
    subject: 'Reset Your Password - WebTours',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br>WebTours Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Password reset email sent', { to });
  } catch (err) {
    logger.error('Password reset email error', { error: err.message, to });
    throw err;
  }
}

/**
 * Send 2FA enabled email notification
 * @param {string} to - Recipient email address
 * @returns {Promise} Nodemailer send mail promise
 */
async function send2FAEnabledEmail(to) {
  const mailOptions = {
    from: `"WebTours Security" <${process.env.SMTP_FROM}>`,
    to,
    subject: 'Two-Factor Authentication Enabled - WebTours',
    html: `
      <h1>Two-Factor Authentication Enabled</h1>
      <p>Two-factor authentication has been enabled for your WebTours account.</p>
      <p>If you didn't make this change, please contact support immediately.</p>
      <p>Best regards,<br>WebTours Security Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('2FA enabled email sent', { to });
  } catch (err) {
    logger.error('2FA enabled email error', { error: err.message, to });
    throw err;
  }
}

/**
 * Send login notification for new device/location
 * @param {string} to - Recipient email address
 * @param {Object} loginInfo - Information about the login attempt
 * @returns {Promise} Nodemailer send mail promise
 */
async function sendLoginNotificationEmail(to, loginInfo) {
  const mailOptions = {
    from: `"WebTours Security" <${process.env.SMTP_FROM}>`,
    to,
    subject: 'New Login Detected - WebTours',
    html: `
      <h1>New Login Detected</h1>
      <p>We detected a new login to your WebTours account from:</p>
      <ul>
        <li>Device: ${loginInfo.userAgent}</li>
        <li>Location: ${loginInfo.location}</li>
        <li>Time: ${loginInfo.time}</li>
      </ul>
      <p>If this wasn't you, please change your password immediately and enable two-factor authentication.</p>
      <p>Best regards,<br>WebTours Security Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Login notification email sent', { to });
  } catch (err) {
    logger.error('Login notification email error', { error: err.message, to });
    throw err;
  }
}

module.exports = {
  sendPasswordResetEmail,
  send2FAEnabledEmail,
  sendLoginNotificationEmail
}; 
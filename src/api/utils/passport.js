const passport = require('passport');
const db = require('./db');
const logger = require('./logger');

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

// We're not using OAuth strategies for now
// This ensures no OAuth-related code is loaded or executed

module.exports = passport; 
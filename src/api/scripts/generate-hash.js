const bcrypt = require('bcrypt');

async function generateHash(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

// Generate hash for test users
generateHash('password123'); 
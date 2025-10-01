const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateJWTSecret() {
  return crypto.randomBytes(32).toString('base64');
}

console.log('🔐 Generated Secure Secrets for .env file:');
console.log('');
console.log('# JWT Configuration');
console.log(`JWT_SECRET="${generateJWTSecret()}"`);
console.log(`JWT_REFRESH_SECRET="${generateJWTSecret()}"`);
console.log('');
console.log('# Session Configuration');
console.log(`SESSION_SECRET="${generateSecret(32)}"`);
console.log(`COOKIE_SECRET="${generateSecret(32)}"`);
console.log('');
console.log('# Copy these values to your .env file');
console.log('');
console.log('⚠️  IMPORTANT: Never commit .env file to version control!');

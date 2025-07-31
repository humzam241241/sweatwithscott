// scripts/set-secret.js
const fs = require('fs');
const crypto = require('crypto');

const envExample = '.env.example';
const envFile = '.env';

// Copy template if .env doesn't exist
if (!fs.existsSync(envFile)) {
  if (!fs.existsSync(envExample)) {
    console.error('ERROR: .env.example not found.');
    process.exit(1);
  }
  fs.copyFileSync(envExample, envFile);
  console.log('Copied .env.example to .env');
}

let content = fs.readFileSync(envFile, 'utf8');
const secret = crypto.randomBytes(32).toString('hex');
content = content.replace('replace_with_a_random_64_char_or_base64_string', secret);
fs.writeFileSync(envFile, content);
console.log('✅ SESSION_SECRET set in .env');
console.log('Secret (for your reference, do not commit):', secret);

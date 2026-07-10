require('dotenv').config();
const { ConfigService } = require('@nestjs/config');
console.log('SMTP_HOST env:', process.env.SMTP_HOST);
console.log('SMTP_USER env:', process.env.SMTP_USER);
console.log('SMTP_PASS env:', process.env.SMTP_PASS ? 'SET' : 'MISSING');

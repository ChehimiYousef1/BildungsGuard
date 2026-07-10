const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.service.ts', 'utf8');

// Check current constructor
const hasMailService = c.includes('private readonly mail: MailService');
console.log('Has MailService:', hasMailService);
console.log('Has sendWelcomeEmail:', c.includes('sendWelcomeEmail'));

// Find create method
const createIdx = c.indexOf('async create(');
console.log('create method at:', createIdx);
console.log(c.slice(createIdx, createIdx + 200));

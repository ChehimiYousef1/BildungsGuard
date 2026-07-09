const fs = require('fs');
let c = fs.readFileSync('src/participants/participants.service.ts', 'utf8');

c = c.replace(
  "const { email, password, ...rest } = dto;",
  "const { email, password, sendWelcomeEmail, ...rest } = dto;"
);

fs.writeFileSync('src/participants/participants.service.ts', c, 'utf8');
console.log('DONE');

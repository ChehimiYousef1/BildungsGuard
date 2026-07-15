const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Find second occurrence of SupportTicket and remove from there to end
const first = c.indexOf('model SupportTicket');
const second = c.indexOf('model SupportTicket', first + 1);

if (second > -1) {
  c = c.slice(0, second).trimEnd();
  console.log('Removed duplicate at:', second);
}

fs.writeFileSync('prisma/schema.prisma', c, 'utf8');
console.log('DONE');
console.log('Count:', (c.match(/model SupportTicket/g)||[]).length);

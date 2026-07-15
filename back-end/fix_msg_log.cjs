const fs = require('fs');
let s = fs.readFileSync('src/support/support.service.ts', 'utf8');

s = s.replace(
  "  async addMessage(tenantId: string, user: any, ticketId: string, dto: any) {",
  "  async addMessage(tenantId: string, user: any, ticketId: string, dto: any) {\n    console.log('[Support] addMessage - user:', JSON.stringify(user), '| ticketId:', ticketId, '| dto:', JSON.stringify(dto));"
);

fs.writeFileSync('src/support/support.service.ts', s, 'utf8');
console.log('DONE');

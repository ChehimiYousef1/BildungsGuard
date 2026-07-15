const fs = require('fs');
let s = fs.readFileSync('src/support/support.service.ts', 'utf8');

s = s.replace(
  "  async create(tenantId: string, user: any, dto: any) {",
  "  async create(tenantId: string, user: any, dto: any) {\n    console.log('[Support] create - user:', JSON.stringify(user), '| dto:', JSON.stringify(dto));"
);

fs.writeFileSync('src/support/support.service.ts', s, 'utf8');
console.log('DONE');

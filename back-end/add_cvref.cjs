const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');

c = c.replace(
  "  expiry              String?\n  tenantId            String",
  "  expiry              String?\n  cvRef               String?\n  tenantId            String"
);

fs.writeFileSync('prisma/schema.prisma', c, 'utf8');
console.log('DONE');

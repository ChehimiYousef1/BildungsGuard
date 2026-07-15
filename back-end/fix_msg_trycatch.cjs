const fs = require('fs');
let s = fs.readFileSync('src/support/support.service.ts', 'utf8');

s = s.replace(
  "    const msg = await this.prisma.client.supportMessage.create({",
  "    try {\n    const msg = await this.prisma.client.supportMessage.create({"
);

s = s.replace(
  "    return msg;\n  }\n}",
  "    return msg;\n    } catch(e) { console.error('[Support] addMessage ERROR:', e.message); throw e; }\n  }\n}"
);

fs.writeFileSync('src/support/support.service.ts', s, 'utf8');
console.log('DONE');

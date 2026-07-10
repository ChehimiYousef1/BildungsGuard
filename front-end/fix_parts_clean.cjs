const fs = require('fs');
let c = fs.readFileSync('src/features/attendance/Sessions.tsx', 'utf8');

c = c.replace(
  "items: allParts.map((p: any) => p.contact ? p.name + '   ' + p.contact : p.name)",
  "items: allParts.map((p: any) => p.contact ? p.name + '  |  ' + p.contact : p.name)"
);

fs.writeFileSync('src/features/attendance/Sessions.tsx', c, 'utf8');
console.log('DONE');

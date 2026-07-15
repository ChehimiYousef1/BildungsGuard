const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

c = c.replace(
  "          id:       p.id,",
  "          id:       p.id,\n          measureId: p.measureId ?? measure?.id ?? null,"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

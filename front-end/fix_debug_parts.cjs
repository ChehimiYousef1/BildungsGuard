const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

c = c.replace(
  "setParts(list);",
  "setParts(list);\n        console.log('[parts]', list.map((p) => ({id: p.id, name: p.name})));"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

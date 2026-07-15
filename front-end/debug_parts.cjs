const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

c = c.replace(
  "setParts(pList);",
  "setParts(pList);\n      console.log('[parts]', pList.map((p) => ({id: p.id, name: p.name})));"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

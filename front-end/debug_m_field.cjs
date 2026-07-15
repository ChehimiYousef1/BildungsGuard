const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// Log each alumni m field
c = c.replace(
  "setAlumni(list);",
  "setAlumni(list);\n      console.log('[alumni m fields]', list.map((a) => ({ name: a.name, m: a.m, measureId: a.measureId })));"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

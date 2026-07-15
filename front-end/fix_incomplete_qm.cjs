const fs = require('fs');
let d = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

d = d.replace(
  ": `${incompleteParts} incomplete participant files`, color: C.amber, view: 'participants'",
  ": `${incompleteParts} incomplete participant files`, color: C.amber, view: 'qm'"
);

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', d, 'utf8');
console.log('DONE');

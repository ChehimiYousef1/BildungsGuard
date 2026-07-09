const fs = require('fs');
let c = fs.readFileSync('src/features/participants/Akte.tsx', 'utf8');

c = c.replace(
  "const activeDocs = docs.filter((d) => d.status !== 'not_active' && d.status !== 'inactive');",
  "const activeDocs = docs.filter((d) => d.status === 'doc_ready' || d.status === 'doc_partial' || d.status === 'doc_manual');"
);

fs.writeFileSync('src/features/participants/Akte.tsx', c, 'utf8');
console.log('DONE');

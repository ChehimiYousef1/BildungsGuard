const fs = require('fs');
let c = fs.readFileSync('src/features/participants/Akte.tsx', 'utf8');

// Fix filter - only exclude explicitly 'not_active' or 'inactive'
c = c.replace(
  "const activeDocs = docs.filter((d) => d.status && d.status !== 'not_active' && d.status !== 'inactive');",
  "const activeDocs = docs.filter((d) => d.status !== 'not_active' && d.status !== 'inactive');"
);

fs.writeFileSync('src/features/participants/Akte.tsx', c, 'utf8');
console.log('DONE');

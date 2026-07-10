const fs = require('fs');
let c = fs.readFileSync('src/features/measures/List.tsx', 'utf8');

c = c.replace(
  "r.status === 'completed' || r.status === 'finished'",
  "r.status === 'completed' || r.status === 'finished' || r.status === 'done'"
);

fs.writeFileSync('src/features/measures/List.tsx', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let s = fs.readFileSync('src/measures/measures.service.ts', 'utf8');

// Fix: use updated.name instead of id
s = s.replace(
  "measure:     updated.name,",
  "measure:     updated.name,"
);

// Fix participants service too
let p = fs.readFileSync('src/participants/participants.service.ts', 'utf8');
p = p.replace(
  "measure:     (updated as any).measureName ?? (updated as any).measureId ?? '',",
  "measure:     '',  // will be set separately"
);
fs.writeFileSync('src/participants/participants.service.ts', p, 'utf8');

fs.writeFileSync('src/measures/measures.service.ts', s, 'utf8');
console.log('DONE');

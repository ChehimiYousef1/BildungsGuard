const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');

c = c.replace(
  "{translateText(a.m ?? a.measureName ?? a.measure?.name ?? '', lang) || '—'}",
  "{a.measure ?? a.m ?? a.measureName ?? '—'}"
);

fs.writeFileSync('src/features/qm/QM.tsx', c, 'utf8');
console.log('DONE');

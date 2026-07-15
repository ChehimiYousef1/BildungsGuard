const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

c = c.replace(
  "          m:        measure?.name ?? translateText(measure?.name ?? \"\", lang) ?? p.m ?? '—',",
  "          m:        measure?.name ?? translateText(measure?.name ?? \"\", lang) ?? p.m ?? '—',\n          _debug_measureId: p.measureId,\n          _debug_measureName: measure?.name,"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

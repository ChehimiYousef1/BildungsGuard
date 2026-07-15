const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// Fix m field to use measure name
c = c.replace(
  "          m:        translateText(measure?.name ?? \"\", lang) ?? p.m ?? p.translateText(measure?.name ?? \"\", lang) ?? '—',",
  "          m:        measure?.name ?? translateText(measure?.name ?? \"\", lang) ?? p.m ?? '—',"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

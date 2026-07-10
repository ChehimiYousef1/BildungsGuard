const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Replace ALL broken replacement chars
c = c.replace(/\uFFFD/g, '-');

// Fix STATUS_MAP fallback
c = c.replace(
  "STATUS_MAP[d.status]?.[lang] ?? d.status ?? '-'",
  "STATUS_MAP[d.status] ? STATUS_MAP[d.status][lang] : (d.status ?? '')"
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
const broken = (c.match(/\uFFFD/g) || []).length;
console.log('Broken chars remaining:', broken);
console.log('DONE');

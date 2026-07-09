const fs = require('fs');
let c = fs.readFileSync('src/features/participants/Akte.tsx', 'utf8');

// Replace ALL remaining docs.length with activeDocs.length
c = c.split('docs.length').join('activeDocs.length');

fs.writeFileSync('src/features/participants/Akte.tsx', c, 'utf8');

const remaining = (c.match(/docs\.length/g) || []).length;
const active    = (c.match(/activeDocs\.length/g) || []).length;
console.log('docs.length remaining:', remaining);
console.log('activeDocs.length count:', active);
console.log('DONE');

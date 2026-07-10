const fs = require('fs');
let c = fs.readFileSync('src/features/attendance/Sessions.tsx', 'utf8');

// Fix the participants items line
const oldPat = /items: allParts\.map\(\(p: any\) => p\.contact \? p\.name \+ '.*?' \+ p\.contact : p\.name\)/;
c = c.replace(oldPat, "items: allParts.map((p: any) => p.contact ? p.name + ' ' + p.contact : p.name)");

fs.writeFileSync('src/features/attendance/Sessions.tsx', c, 'utf8');
console.log('DONE');

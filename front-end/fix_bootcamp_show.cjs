const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');
c = c.replace(
  "<td style={{ fontSize: 12.5 }}>{a.m}</td>",
  "<td style={{ fontSize: 12.5, color: C.inkSoft }}>{a.m || '-'}</td>"
);
fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

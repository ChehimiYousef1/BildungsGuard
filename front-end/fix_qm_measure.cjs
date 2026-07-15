const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');
const lines = c.split('\n');
lines[666] = "                      <td style={{ fontSize: 12.5 }}>{a.measure ?? a.m ?? a.measureName ?? '-'}</td>";
fs.writeFileSync('src/features/qm/QM.tsx', lines.join('\n'), 'utf8');
console.log('DONE');
console.log('Line 667:', lines[666]);

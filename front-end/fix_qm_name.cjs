const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');
const lines = c.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("part ? part.name : '—'") && lines[i+1] && lines[i+1].includes("part ? part.contact")) {
    console.log('Found at line:', i + 1);
    lines[i] = "                      <div style={{ fontSize: 13, fontWeight: 600 }}>{d._isQmDoc ? (de ? (d._qm?.titleDe ?? d._qm?.title ?? 'QM') : (d._qm?.title ?? 'QM')) : part ? part.name : d.responsible ?? '-'}</div>";
    break;
  }
}

c = lines.join('\n');
fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');
const lines = c.split('\n');
lines[1661] = "                      <div style={{ fontSize: 13, fontWeight: 600 }}>{d._isQmDoc ? (de ? (d._qm?.titleDe ?? d._qm?.title ?? '-') : (d._qm?.title ?? d._qm?.titleDe ?? '-')) : d._isCourseRec ? (d._cr?.topic ?? '-') : d._isCourseEval ? (d._ce?.period ?? '-') : part ? part.name : d.responsible ?? '-'}</div>";
fs.writeFileSync('src/features/documents/DocumentModel.tsx', lines.join('\n'), 'utf8');
console.log('DONE');

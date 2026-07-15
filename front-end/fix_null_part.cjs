const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// In catModal - fix display when participant is null
c = c.replace(
  "                      <div style={{ fontSize: 13, fontWeight: 600 }}>{part ? part.name : '—'}</div>\n                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{part ? part.contact : ''}</div>",
  "                      <div style={{ fontSize: 13, fontWeight: 600 }}>{part ? part.name : (d.responsible ?? typeLabel(d.type))}</div>\n                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{part ? part.contact : (d.measureId ? de ? 'Bootcamp-Dokument' : 'Bootcamp document' : '')}</div>"
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

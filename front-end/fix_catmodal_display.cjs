const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Fix participant name display - show bootcamp/course name when no participant
c = c.replace(
  "                      <div style={{ fontSize: 13, fontWeight: 600 }}>{part ? part.name : (d.responsible ?? typeLabel(d.type))}</div>\n                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{part ? part.contact : (d.measureId ? de ? 'Bootcamp-Dokument' : 'Bootcamp document' : '')}",
  "                      <div style={{ fontSize: 13, fontWeight: 600 }}>{part ? part.name : d.responsible ? d.responsible : (measures.find((m) => m.id === d.measureId)?.name ?? typeLabel(d.type))}</div>\n                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{part ? part.contact : d.measureId ? (de ? 'Bootcamp-Dokument' : 'Bootcamp document') : ''}"
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

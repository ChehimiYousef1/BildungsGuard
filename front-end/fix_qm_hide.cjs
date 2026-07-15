const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Hide the docs list when QM_DOC is selected
c = c.replace(
  "{allDocs.filter(d => d.type === filterType && (!catSearch || (participants.find(p => p.id === d.participantId)?.name ?? '').toLowerCase().includes(catSearch.toLowerCase()) || typeLabel(d.type).toLowerCase().includes(catSearch.toLowerCase()))).map((d, i) => {",
  "{filterType !== 'QM_DOC' && allDocs.filter(d => d.type === filterType && (!catSearch || (participants.find(p => p.id === d.participantId)?.name ?? '').toLowerCase().includes(catSearch.toLowerCase()) || typeLabel(d.type).toLowerCase().includes(catSearch.toLowerCase()))).map((d, i) => {"
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

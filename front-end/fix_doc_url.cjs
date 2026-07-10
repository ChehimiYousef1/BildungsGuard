const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

c = c.replace(
  '`${API}/documents/${id}/file`',
  '`${API}/documents/${id}/upload`'
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');
console.log('Has /upload:', c.includes('/documents/${id}/upload'));

const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');
const lines = c.split('\n');

// Remove warn reference - just show ok and miss
lines[1241] = "                        {pDocs.length > 0 && <>" +
  "<span style={{ color: '#0FB6A0', marginLeft: 6 }}>{ok} ok</span>" +
  "{miss > 0 && <span style={{ color: '#F4475F', marginLeft: 6 }}>{miss} missing</span>}" +
  "</>}";

c = lines.join('\n');
fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

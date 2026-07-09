const fs = require('fs');
let c = fs.readFileSync('src/features/participants/Akte.tsx', 'utf8');

// Fix count
c = c.replace("documents')} · {docs.length}", "documents')} · {activeDocs.length}");

// Fix empty state - replace "0" with proper message
c = c.replace(
  "docs.length === 0 && (\n            <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>0</div>",
  "activeDocs.length === 0 && (\n            <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>{de ? 'Keine Dokumente hochgeladen.' : 'No documents uploaded yet.'}</div>"
);

fs.writeFileSync('src/features/participants/Akte.tsx', c, 'utf8');
console.log('DONE');

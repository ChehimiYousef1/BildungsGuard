const fs = require('fs');
let c = fs.readFileSync('src/features/participants/Akte.tsx', 'utf8');

// Filter docs to only show active ones
c = c.replace(
  "const [docs, setDocs]               = useState<any[]>([]);",
  "const [docs, setDocs]               = useState<any[]>([]);\n  const activeDocs = docs.filter((d) => d.status && d.status !== 'not_active' && d.status !== 'inactive');"
);

// Update doc count in header
c = c.replace(
  "<div className=\"card-title\">{t('documents')} · {docs.length}</div>",
  "<div className=\"card-title\">{t('documents')} · {activeDocs.length}</div>"
);

// Update empty state
c = c.replace(
  "          {!loadingDocs && docs.length === 0 && (\n            <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>0</div>\n          )}",
  "          {!loadingDocs && activeDocs.length === 0 && (\n            <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>{de ? 'Keine Dokumente hochgeladen.' : 'No documents uploaded yet.'}</div>\n          )}"
);

// Update map to use activeDocs
c = c.replace(
  "          {!loadingDocs && docs.map((d, i) => (",
  "          {!loadingDocs && activeDocs.map((d, i) => ("
);

fs.writeFileSync('src/features/participants/Akte.tsx', c, 'utf8');
console.log('DONE');

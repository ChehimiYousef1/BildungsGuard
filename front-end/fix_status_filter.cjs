const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Revert filterType init
c = c.replace(
  "  const [filterType, setFilterType] = useState(() => { const f = localStorage.getItem('docs_init_filter'); if (f) { localStorage.removeItem('docs_init_filter'); return f; } return ''; });",
  "  const [filterType, setFilterType] = useState('');"
);

// Add filterStatus state
c = c.replace(
  "  const [filterType, setFilterType] = useState('');",
  "  const [filterType, setFilterType] = useState('');\n  const [filterStatus, setFilterStatus] = useState(() => { const f = localStorage.getItem('docs_init_filter'); if (f) { localStorage.removeItem('docs_init_filter'); return f; } return ''; });"
);

// Apply status filter in filtered
c = c.replace(
  "  const filtered = allDocs.filter((d) => {\n    if (filterType && d.type !== filterType) return false;\n    if (filterPart && d.participantId !== filterPart) return false;\n    return true;\n  });",
  "  const filtered = allDocs.filter((d) => {\n    if (filterType && d.type !== filterType) return false;\n    if (filterPart && d.participantId !== filterPart) return false;\n    if (filterStatus === 'missing' && d.status !== 'doc_missing') return false;\n    return true;\n  });"
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let d = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

// Change view to docs and set filter to incomplete
d = d.replace(
  ": `${incompleteParts} incomplete participant files`, color: C.amber, view: 'qm'",
  ": `${incompleteParts} incomplete participant files`, color: C.amber, view: 'docs'"
);

// Add localStorage filter for incomplete
d = d.replace(
  "if (item.view === 'docs' && item.label?.toLowerCase().includes('missing')) { localStorage.setItem('docs_init_filter', 'missing'); }",
  "if (item.view === 'docs' && item.label?.toLowerCase().includes('missing')) { localStorage.setItem('docs_init_filter', 'missing'); } if (item.view === 'docs' && item.label?.toLowerCase().includes('incomplete')) { localStorage.setItem('docs_init_filter', 'incomplete'); }"
);

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', d, 'utf8');
console.log('Dashboard fixed');

// Fix Documents - apply incomplete filter
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');
c = c.replace(
  "    if (filterStatus === 'missing' && d.status !== 'doc_missing') return false;",
  "    if (filterStatus === 'missing' && d.status !== 'doc_missing') return false;\n    if (filterStatus === 'incomplete' && (d.status === 'doc_ready' || d.status === 'doc_manual')) return false;"
);
fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('Docs fixed');

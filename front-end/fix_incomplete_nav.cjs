const fs = require('fs');
let d = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

d = d.replace(
  ": `${incompleteParts} incomplete participant files`, color: C.amber, view: 'participants'",
  ": `${incompleteParts} incomplete participant files`, color: C.amber, view: 'participants'"
);

// Change view for incomplete participants to docs with filter
d = d.replace(
  "if (item.view === 'docs' && item.label?.toLowerCase().includes('missing')) { localStorage.setItem('docs_init_filter', 'missing'); }",
  "if (item.view === 'docs' && item.label?.toLowerCase().includes('missing')) { localStorage.setItem('docs_init_filter', 'missing'); }\n              if (item.view === 'participants' && item.label?.toLowerCase().includes('incomplete')) { setView('participants'); return; }"
);

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', d, 'utf8');
console.log('DONE');

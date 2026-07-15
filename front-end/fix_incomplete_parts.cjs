const fs = require('fs');
let d = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

// Change to open Participants page
d = d.replace(
  ": `${incompleteParts} incomplete participant files`, color: C.amber, view: 'docs'",
  ": `${incompleteParts} incomplete participant files`, color: C.amber, view: 'participants'"
);

// Remove incomplete docs filter
d = d.replace(
  " if (item.view === 'docs' && item.label?.toLowerCase().includes('incomplete')) { localStorage.setItem('docs_init_filter', 'incomplete'); }",
  " if (item.view === 'participants' && item.label?.toLowerCase().includes('incomplete')) { localStorage.setItem('parts_filter_incomplete', '1'); }"
);

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', d, 'utf8');
console.log('Dashboard fixed');

// Fix Participants list to filter incomplete
let p = fs.readFileSync('src/features/participants/List.tsx', 'utf8');
p = p.replace(
  "  const [filterMeasure, setFilterMeasure] = useState('');",
  "  const [filterMeasure, setFilterMeasure] = useState('');\n  const [filterIncomplete, setFilterIncomplete] = useState(() => { const f = localStorage.getItem('parts_filter_incomplete'); if (f) { localStorage.removeItem('parts_filter_incomplete'); return true; } return false; });"
);

p = p.replace(
  "  const filteredRows = rows.filter((p) => {",
  "  const filteredRows = rows.filter((p) => {\n    if (filterIncomplete && (p.fileCompleteness ?? 0) >= 100) return false;"
);

fs.writeFileSync('src/features/participants/List.tsx', p, 'utf8');
console.log('Participants fixed');

const fs = require('fs');

// Dashboard - save filter when navigating to docs
let d = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');
d = d.replace(
  "if (item.view) { if (item.view === 'qm' && item.label?.toLowerCase().includes('capa')) { localStorage.setItem('qm_init_tab', 'capa'); } setView(item.view); }",
  "if (item.view) { if (item.view === 'qm' && item.label?.toLowerCase().includes('capa')) { localStorage.setItem('qm_init_tab', 'capa'); } if (item.view === 'docs' && item.label?.toLowerCase().includes('missing')) { localStorage.setItem('docs_init_filter', 'missing'); } setView(item.view); }"
);
fs.writeFileSync('src/features/dashboard/Dashboard.tsx', d, 'utf8');
console.log('Dashboard fixed');

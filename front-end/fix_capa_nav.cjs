const fs = require('fs');

// 1. Fix Dashboard - save desired tab before navigating
let d = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');
d = d.replace(
  "if (item.view) setView(item.view);",
  "if (item.view) { if (item.view === 'qm' && item.label?.toLowerCase().includes('capa')) { localStorage.setItem('qm_init_tab', 'capa'); } setView(item.view); }"
);
fs.writeFileSync('src/features/dashboard/Dashboard.tsx', d, 'utf8');
console.log('Dashboard fixed');

// 2. Fix QM - read the tab from localStorage on mount
let q = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');
q = q.replace(
  "  const [tab, setTab] = useState('kpi');",
  "  const [tab, setTab] = useState(() => { const t = localStorage.getItem('qm_init_tab'); if (t) { localStorage.removeItem('qm_init_tab'); return t; } return 'kpi'; });"
);
fs.writeFileSync('src/features/qm/QM.tsx', q, 'utf8');
console.log('QM fixed');

const fs = require('fs');
let q = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');

// Revert useState
q = q.replace(
  "  const [tab, setTab] = useState(() => { const t = localStorage.getItem('qm_init_tab'); if (t) { localStorage.removeItem('qm_init_tab'); return t; } return 'kpi'; });",
  "  const [tab, setTab] = useState('kpi');"
);

// Add useEffect
q = q.replace(
  "  const [tab, setTab] = useState('kpi');",
  "  const [tab, setTab] = useState('kpi');\n  useEffect(() => { const t = localStorage.getItem('qm_init_tab'); if (t) { localStorage.removeItem('qm_init_tab'); setTab(t); } }, []);"
);

fs.writeFileSync('src/features/qm/QM.tsx', q, 'utf8');
console.log('DONE');

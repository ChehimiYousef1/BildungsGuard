const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// 1. Add search state
if (!c.includes('catSearch')) {
  c = c.replace(
    "const [catModal, setCatModal] = useState(false);",
    "const [catModal, setCatModal] = useState(false);\n  const [catSearch, setCatSearch] = useState('');"
  );
}

// 2. Clear search when modal closes
c = c.replace(
  "onClick={() => setCatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>",
  "onClick={() => { setCatModal(false); setCatSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>"
);

// 3. Add search input after modal header
c = c.replace(
  "            <div style={{ overflowY: 'auto', padding: '10px 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>",
  "            <div style={{ padding: '8px 14px', borderBottom: '1px solid #F1F5F9' }}>\n              <input\n                value={catSearch}\n                onChange={(e) => setCatSearch(e.target.value)}\n                placeholder={de ? 'Suchen...' : 'Search...'}\n                style={{ width: '100%', padding: '7px 11px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12.5, outline: 'none', boxSizing: 'border-box' }}\n                autoFocus\n              />\n            </div>\n            <div style={{ overflowY: 'auto', padding: '10px 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>"
);

// 4. Filter docs by search
c = c.replace(
  "{allDocs.filter(d => d.type === filterType).length === 0 && (",
  "{allDocs.filter(d => d.type === filterType && (!catSearch || (participants.find(p => p.id === d.participantId)?.name ?? '').toLowerCase().includes(catSearch.toLowerCase()) || typeLabel(d.type).toLowerCase().includes(catSearch.toLowerCase()))).length === 0 && ("
);

c = c.replace(
  "{allDocs.filter(d => d.type === filterType).map((d, i) => {",
  "{allDocs.filter(d => d.type === filterType && (!catSearch || (participants.find(p => p.id === d.participantId)?.name ?? '').toLowerCase().includes(catSearch.toLowerCase()) || typeLabel(d.type).toLowerCase().includes(catSearch.toLowerCase()))).map((d, i) => {"
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

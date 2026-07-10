const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Add catModal state
if (!c.includes('catModal')) {
  c = c.replace(
    "const [filterType, setFilterType] = useState('');",
    "const [filterType, setFilterType] = useState('');\n  const [catModal, setCatModal] = useState(false);"
  );
}

// Change category card onClick to open modal
c = c.replace(
  "onClick={() => setFilterType(isActive ? '' : cat.type)}",
  "onClick={() => { setFilterType(cat.type); setCatModal(true); }}"
);

// Add modal before closing tag of component
const closeTag = "    </div>\n  );\n}";
const modal = `
      {/* ===== CATEGORY DOCS MODAL ===== */}
      {catModal && filterType && (
        <div onClick={() => setCatModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={15} color={C.iris} />
                {typeLabel(filterType)} &middot; {allDocs.filter(d => d.type === filterType).length}
              </div>
              <button onClick={() => setCatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ overflowY: 'auto', padding: '10px 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {allDocs.filter(d => d.type === filterType).length === 0 ? (
                <div style={{ padding: 20, color: C.muted, fontSize: 13, textAlign: 'center' }}>
                  {de ? 'Keine Dokumente vorhanden.' : 'No documents yet.'}
                </div>
              ) : (
                allDocs.filter(d => d.type === filterType).map((d, i) => {
                  const part = participants.find(p => p.id === d.participantId);
                  return (
                    <div key={d.id ?? i}
                      onClick={() => { setCatModal(false); setSelDoc(d); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        borderRadius: 9, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer' }}>
                      <div style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                        background: d.status === 'doc_ready' ? '#0FB6A0' : d.status === 'doc_partial' || d.status === 'doc_manual' ? '#F59E0B' : '#F4475F' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{part?.name ?? '—'}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{part?.contact ?? ''}</div>
                      </div>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                        background: d.status === 'doc_ready' ? '#E1F5EE' : d.status === 'doc_partial' || d.status === 'doc_manual' ? '#FAEEDA' : '#FCEBEB',
                        color: d.status === 'doc_ready' ? '#085041' : d.status === 'doc_partial' || d.status === 'doc_manual' ? '#633806' : '#501313' }}>
                        {STATUS_MAP[d.status]?.[lang] ?? d.status ?? 'N/A'}
                      </span>
                      <ChevronRight size={14} color="#CBD5E1" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
`;

const lastClose = c.lastIndexOf(closeTag);
if (lastClose > -1) {
  c = c.slice(0, lastClose) + modal + closeTag;
  console.log('Modal added OK');
} else {
  console.log('Close tag not found');
}

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Add inline filtered results right after category cards grid
const marker = "      {/* ===== MINI STATS ===== */}";
const inlineSection = `      {/* ===== INLINE FILTERED DOCS ===== */}
      {filterType && (
        <div className="card" style={{ padding: '14px 8px 8px' }}>
          <div className="card-head" style={{ padding: '0 13px 10px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} color={C.iris} />
              {typeLabel(filterType)} &middot; {allDocs.filter(d => d.type === filterType).length}
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 12 }}
              onClick={() => setFilterType('')}>
              <X size={15} />
            </button>
          </div>
          {allDocs.filter(d => d.type === filterType).length === 0 ? (
            <div style={{ padding: '10px 14px 14px', color: C.muted, fontSize: 13 }}>
              {de ? 'Keine Dokumente vorhanden.' : 'No documents yet.'}
            </div>
          ) : (
            <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {allDocs.filter(d => d.type === filterType).map((d, i) => {
                const part = participants.find(p => p.id === d.participantId);
                return (
                  <div key={d.id ?? i} onClick={() => setSelDoc(d)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                      borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: d.status === 'doc_ready' ? '#0FB6A0' : d.status === 'doc_partial' || d.status === 'doc_manual' ? '#F59E0B' : '#F4475F' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{part?.name ?? d.participantId ?? '—'}</div>
                      {d.notes && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{d.notes}</div>}
                    </div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                      background: d.status === 'doc_ready' ? '#E1F5EE' : d.status === 'doc_partial' || d.status === 'doc_manual' ? '#FAEEDA' : '#FCEBEB',
                      color: d.status === 'doc_ready' ? '#085041' : d.status === 'doc_partial' || d.status === 'doc_manual' ? '#633806' : '#501313' }}>
                      {STATUS_MAP[d.status]?.[lang] ?? d.status ?? '—'}
                    </span>
                    <ChevronRight size={14} color="#CBD5E1" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      `;

// Add ChevronRight if missing
if (!c.includes('ChevronRight')) {
  c = c.replace(
    "import {\n  FileText, Plus, X,",
    "import {\n  FileText, Plus, X, ChevronRight,"
  );
}

if (c.includes(marker)) {
  c = c.replace(marker, inlineSection + marker);
  console.log('Inline section added OK');
} else {
  console.log('Marker not found');
}

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

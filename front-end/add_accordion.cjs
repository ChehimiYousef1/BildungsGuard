const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Add openPart state
c = c.replace(
  "  const [filterPart, setFilterPart]   = useState('');",
  "  const [filterPart, setFilterPart]   = useState('');\n  const [openPart,   setOpenPart]     = useState<string | null>(null);"
);

// Replace filter + table section with accordion
const oldSection = `        <div style={{ display: 'flex', gap: 10, padding: '0 13px 14px', flexWrap: 'wrap' }}>
          <select value={filterPart} onChange={(e) => setFilterPart(e.target.value)} style={selectSt}>
            <option value="">{de ? '— Alle Teilnehmer —' : '— All participants —'}</option>
            {participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {filterPart && (
            <button className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12 }}
              onClick={() => setFilterPart('')}>
              <X size={12} /> {de ? 'Filter aufheben' : 'Clear'}
            </button>
          )}
        </div>

        {loading && <div style={{ padding: '0 13px 14px', color: C.muted, fontSize: 13 }}>…</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '0 13px 20px', color: C.muted, fontSize: 13 }}>
            {de ? 'Keine Dokumente vorhanden.' : 'No documents yet.'}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="scroll-x">`;

const newSection = `        {loading && <div style={{ padding: '0 13px 14px', color: C.muted, fontSize: 13 }}>…</div>}

        {/* ===== ACCORDION BY PARTICIPANT ===== */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {participants.map((p) => {
              const pDocs = allDocs.filter((d: any) => d.participantId === p.id);
              const isOpen = openPart === p.id;
              const complete = pDocs.filter((d: any) => d.status === 'doc_ready').length;
              const missing  = pDocs.filter((d: any) => d.status === 'doc_missing' || !d.status).length;
              return (
                <div key={p.id} style={{ borderBottom: \`1px solid \${C.lineSoft}\` }}>
                  {/* Row */}
                  <div
                    onClick={() => { setOpenPart(isOpen ? null : p.id); setFilterPart(isOpen ? '' : p.id); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer', background: isOpen ? C.iris + '06' : '#fff', transition: 'background .15s' }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: isOpen ? C.iris : C.soft, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <User size={16} color={isOpen ? '#fff' : C.muted} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: isOpen ? C.iris : '#1e293b' }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                        {pDocs.length} {de ? 'Dokumente' : 'documents'}
                        {pDocs.length > 0 && <span> · <span style={{ color: C.mint }}>? {complete}</span> · <span style={{ color: C.rose }}>? {missing}</span></span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: C.muted, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>?</span>
                  </div>

                  {/* Expanded docs */}
                  {isOpen && (
                    <div style={{ background: '#FAFBFF', borderTop: \`1px solid \${C.lineSoft}\` }}>
                      {pDocs.length === 0 ? (
                        <div style={{ padding: '14px 20px', color: C.muted, fontSize: 13 }}>
                          {de ? 'Keine Dokumente vorhanden.' : 'No documents yet.'}
                        </div>
                      ) : (
          <div className="scroll-x">`;

if (c.includes(oldSection)) {
  c = c.replace(oldSection, newSection);
  console.log('Replaced OK');
} else {
  console.log('Section not found - trying partial');
}

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

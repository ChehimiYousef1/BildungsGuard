const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');

// Add viewDoc modal before closing tag
const closeTag = "    </>\n  );\n}";
const lastClose = c.lastIndexOf(closeTag);

const modal = `
      {/* ===== VIEW QM DOC MODAL ===== */}
      {viewDoc && (
        <div onClick={() => setViewDoc(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{de ? (viewDoc.titleDe ?? viewDoc.title) : (viewDoc.title ?? viewDoc.titleDe)}</div>
              <button onClick={() => setViewDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <div style={{ overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: de ? 'Typ' : 'Type',              value: typeLabel(viewDoc.type) },
                { label: 'Version',                         value: viewDoc.version ?? 'ó' },
                { label: de ? 'Verantwortlich' : 'Owner',  value: viewDoc.owner ?? viewDoc.author ?? 'ó' },
                { label: de ? 'Genehmigt' : 'Approved',    value: viewDoc.approved ?? 'ó' },
                { label: 'Status',                          value: viewDoc.status ?? 'ó' },
                { label: de ? 'Beschreibung' : 'Description', value: viewDoc.description ?? viewDoc.content ?? 'ó' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: 12, color: C.muted, minWidth: 120 }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{row.value}</div>
                </div>
              ))}
              {viewDoc.fileRef && (
                <a href={viewDoc.fileRef} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.iris, fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                  <Download size={14} /> {de ? 'Datei herunterladen' : 'Download file'}
                </a>
              )}
            </div>
            <div style={{ padding: '12px 18px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => { openEditDoc(viewDoc); setViewDoc(null); }} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Pencil size={13} /> {de ? 'Bearbeiten' : 'Edit'}
              </button>
              <button className="btn btn-ghost" onClick={() => setViewDoc(null)} style={{ padding: '8px 16px' }}>
                {de ? 'Schlieﬂen' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

if (lastClose > -1) {
  c = c.slice(0, lastClose) + modal + closeTag;
  console.log('Modal added OK');
} else {
  console.log('Close tag not found');
}

fs.writeFileSync('src/features/qm/QM.tsx', c, 'utf8');
console.log('DONE');

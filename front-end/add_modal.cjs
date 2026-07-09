const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

// 1. Add modal state
c = c.replace(
  "const [hasOpenCapa, setHasOpenCapa] = useState(false);",
  "const [hasOpenCapa, setHasOpenCapa] = useState(false);\n  const [modalParts, setModalParts] = useState<any[]>([]);\n  const [modalOpen, setModalOpen] = useState(false);"
);

// 2. Change participants click to open modal instead of setView
c = c.replace(
  "view: 'participants' });",
  "view: 'participants', action: 'incomplete' });"
);

// 3. Change onClick to handle action
c = c.replace(
  "onClick={() => item.view && setView(item.view)}",
  "onClick={() => { if ((item as any).action === 'incomplete') { setModalParts(participants.filter((p: any) => (p.fileCompleteness ?? 0) < 100)); setModalOpen(true); } else if (item.view) { setView(item.view); } }}"
);

// 4. Add modal before closing fragment
c = c.replace(
  "\n    </>\n  );\n}",
  `
      {/* ===== INCOMPLETE PARTS MODAL ===== */}
      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 500, padding: 0, overflow: 'hidden', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {lang === 'de' ? 'Unvollständige Akten' : 'Incomplete files'} · {modalParts.length}
              </div>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B' }}>×</button>
            </div>
            <div style={{ overflowY: 'auto' }}>
              {modalParts.map((p, i) => (
                <div key={p.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: '#6D5DF620', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, color: '#6D5DF6' }}>
                    {(p.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>{p.contact ?? p.email ?? ''}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: (p.fileCompleteness ?? 0) < 50 ? '#F43F5E' : '#F59E0B' }}>
                      {p.fileCompleteness ?? 0}%
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{lang === 'de' ? 'vollständig' : 'complete'}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0' }}>
              <button onClick={() => { setModalOpen(false); setView('participants'); }} style={{ width: '100%', padding: '10px', borderRadius: 9, background: '#6D5DF6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                {lang === 'de' ? 'Alle Teilnehmer anzeigen' : 'View all participants'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}`
);

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');

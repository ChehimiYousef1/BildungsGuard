const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// 1. Add openPart state
if (!c.includes('openPart')) {
  c = c.replace(
    "const [filterPart, setFilterPart] = useState('');",
    "const [filterPart, setFilterPart] = useState('');\n  const [openPart, setOpenPart] = useState<string | null>(null);"
  );
}

// 2. Add ChevronRight icon if missing
if (!c.includes('ChevronRight')) {
  c = c.replace(
    "import {\n  FileText, Plus, X",
    "import {\n  FileText, Plus, X, ChevronRight, ChevronDown"
  );
}

// 3. Replace the select + table block
const OLD = "        <div style={{ display: 'flex', gap: 10, padding: '0 13px 14px', flexWrap: 'wrap' }}>
          <select value={filterPart} onChange={(e) => setFilterPart(e.target.value)} style={selectSt}>
            <option value=\"\">{de ? '— Alle Teilnehmer —' : '— All participants —'}</option>
            {participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {filterPart && (
            <button className=\"btn btn-ghost\" style={{ padding: '7px 12px', fontSize: 12 }}
              onClick={() => setFilterPart('')}>
              <X size={12} /> {de ? 'Filter aufheben' : 'Clear'}
            </button>
          )}
        </div>";

const NEW = "        {/* ===== ACCORDION BY PARTICIPANT ===== */}
        {participants.length > 0 && !filterType && (
          <div style={{ margin: '0 0 8px' }}>
            {participants.map((p: any) => {
              const pDocs  = allDocs.filter((d: any) => d.participantId === p.id && d.status !== 'not_active' && d.status !== 'inactive');
              const isOpen = openPart === p.id;
              const ok     = pDocs.filter((d: any) => d.status === 'doc_ready').length;
              const warn   = pDocs.filter((d: any) => d.status === 'doc_partial' || d.status === 'doc_manual').length;
              const miss   = pDocs.filter((d: any) => d.status === 'doc_missing').length;
              return (
                <div key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  {/* Participant row */}
                  <div
                    onClick={() => { setOpenPart(isOpen ? null : p.id); setFilterPart(isOpen ? '' : p.id); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', cursor: 'pointer',
                      background: isOpen ? '#6D5DF608' : 'transparent', transition: 'background .15s' }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, display: 'grid', placeItems: 'center',
                      background: isOpen ? '#6D5DF6' : '#F1F5F9' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isOpen ? '#fff' : '#64748B' }}>
                        {p.name?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: isOpen ? '#6D5DF6' : '#1e293b' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, display: 'flex', gap: 8 }}>
                        <span>{pDocs.length} {de ? 'Dokumente' : 'docs'}</span>
                        {pDocs.length > 0 && <>
                          <span style={{ color: '#0FB6A0' }}>? {ok}</span>
                          {warn > 0 && <span style={{ color: '#F59E0B' }}>~ {warn}</span>}
                          {miss > 0 && <span style={{ color: '#F4475F' }}>? {miss}</span>}
                        </>}
                      </div>
                    </div>
                    <div style={{ color: '#CBD5E1', transition: 'transform .2s', transform: isOpen ? 'rotate(90deg)' : 'none' }}>
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  {/* Expanded docs inline */}
                  {isOpen && (
                    <div style={{ background: '#FAFBFF', borderTop: '1px solid #F1F5F9' }}>
                      {pDocs.length === 0 ? (
                        <div style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 13 }}>
                          {de ? 'Keine Dokumente vorhanden.' : 'No documents yet.'}
                        </div>
                      ) : (
                        <div style={{ padding: '8px 16px 14px' }}>
                          {pDocs.map((d: any, i: number) => (
                            <div key={d.id ?? i}
                              onClick={() => setSelDoc(d)}
                              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', marginBottom: 4,
                                borderRadius: 8, background: '#fff', border: '1px solid #E2E8F0', cursor: 'pointer',
                                transition: 'border-color .15s' }}
                            >
                              <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                background: d.status === 'doc_ready' ? '#0FB6A0' : d.status === 'doc_partial' || d.status === 'doc_manual' ? '#F59E0B' : '#F4475F' }} />
                              <div style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: '#1e293b' }}>
                                {typeLabel(d.type)}
                              </div>
                              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                                background: d.status === 'doc_ready' ? '#E1F5EE' : d.status === 'doc_partial' || d.status === 'doc_manual' ? '#FAEEDA' : '#FCEBEB',
                                color: d.status === 'doc_ready' ? '#085041' : d.status === 'doc_partial' || d.status === 'doc_manual' ? '#633806' : '#501313' }}>
                                {STATUS_MAP[d.status]?.[lang as 'de'|'en'] ?? d.status ?? '—'}
                              </span>
                              <ChevronRight size={13} color="#CBD5E1" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}";

if (c.includes(OLD)) {
  c = c.replace(OLD, NEW);
  console.log('Replaced OK');
} else {
  // Try line-based replacement
  const lines = c.split('\n');
  const startLine = lines.findIndex(l => l.includes("display: 'flex', gap: 10, padding: '0 13px 14px'"));
  if (startLine > -1) {
    // Find end of this block
    let end = startLine + 1;
    let depth = 0;
    for (let i = startLine; i < lines.length; i++) {
      depth += (lines[i].match(/<div/g) || []).length;
      depth -= (lines[i].match(/<\/div>/g) || []).length;
      if (depth <= 0 && i > startLine) { end = i + 1; break; }
    }
    lines.splice(startLine, end - startLine, NEW);
    c = lines.join('\n');
    console.log('Replaced via line match at line:', startLine + 1);
  } else {
    console.log('NOT FOUND');
  }
}

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

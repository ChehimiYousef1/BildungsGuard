const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// 1. Add openPart state
if (!c.includes('openPart')) {
  c = c.replace(
    "const [filterPart, setFilterPart] = useState('');",
    "const [filterPart, setFilterPart] = useState('');\n  const [openPart,   setOpenPart]     = useState<string | null>(null);"
  );
}

// 2. Add User icon if not imported
if (!c.includes('User,')) {
  c = c.replace("import {\n  FileText, Plus, X", "import {\n  FileText, Plus, X, User");
}

// 3. Replace select dropdown section with accordion trigger
const selectBlock = c.match(/\s*<div style=\{\{ display: 'flex', gap: 10, padding: '0 13px 14px'[\s\S]*?<\/div>\s*\n\s*\{loading/);
if (selectBlock) {
  c = c.replace(selectBlock[0], `

        {/* ACCORDION LIST */}
        {!loading && participants.length > 0 && (
          <div style={{ borderTop: '1px solid #E2E8F0' }}>
            {participants.map((p: any) => {
              const pDocs  = allDocs.filter((d: any) => d.participantId === p.id);
              const isOpen = openPart === p.id;
              const ok     = pDocs.filter((d: any) => d.status === 'doc_ready').length;
              const miss   = pDocs.filter((d: any) => !d.status || d.status === 'doc_missing').length;
              return (
                <div key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <div onClick={() => { setOpenPart(isOpen ? null : p.id); setFilterPart(isOpen ? '' : p.id); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer',
                      background: isOpen ? '#6D5DF608' : '#fff' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: isOpen ? '#6D5DF6' : '#F1F5F9',
                      display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <User size={15} color={isOpen ? '#fff' : '#64748B'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: isOpen ? '#6D5DF6' : '#1e293b' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                        {pDocs.length} {de ? 'Dokumente' : 'docs'}
                        {pDocs.length > 0 && <> &nbsp;·&nbsp; <span style={{ color: '#0FB6A0' }}>? {ok}</span> &nbsp;·&nbsp; <span style={{ color: '#F4475F' }}>? {miss}</span></>}
                      </div>
                    </div>
                    <span style={{ color: '#CBD5E1', fontSize: 12, transition: 'transform .2s', display: 'inline-block',
                      transform: isOpen ? 'rotate(90deg)' : 'none' }}>?</span>
                  </div>
                  {isOpen && (
                    <div style={{ background: '#FAFBFF', borderTop: '1px solid #F1F5F9', padding: '4px 0 12px' }}>
                      {pDocs.length === 0 ? (
                        <div style={{ padding: '12px 20px', color: '#94A3B8', fontSize: 13 }}>
                          {de ? 'Keine Dokumente.' : 'No documents yet.'}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {loading`);
  console.log('Accordion added OK');
} else {
  console.log('Section not found');
}

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

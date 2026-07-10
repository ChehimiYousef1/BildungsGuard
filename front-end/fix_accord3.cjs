const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Add ChevronDown/ChevronRight if not there
if (!c.includes('ChevronDown')) {
  c = c.replace(
    "import {\n  FileText, Plus, X, Upload, Download, CheckCircle2,\n  AlertTriangle, Circle, Pencil, Trash2, Shield, Laptop,",
    "import {\n  FileText, Plus, X, Upload, Download, CheckCircle2, ChevronDown, ChevronRight,\n  AlertTriangle, Circle, Pencil, Trash2, Shield, Laptop,"
  );
}

// Add openPart state if not there
if (!c.includes('openPart')) {
  c = c.replace(
    "  const [filterPart, setFilterPart] = useState('');",
    "  const [filterPart, setFilterPart] = useState('');\n  const [openPart, setOpenPart] = useState<string|null>(null);"
  );
}

// Find and replace the select + table section
const startMarker = "        <div style={{ display: 'flex', gap: 10, padding: '0 13px 14px', flexWrap: 'wrap' }}>";
const endMarker = "        {!loading && filtered.length > 0 && (\n          <div className=\"scroll-x\">";

const startIdx = c.indexOf(startMarker);
const endIdx = c.indexOf(endMarker);

if (startIdx > -1 && endIdx > -1) {
  const before = c.slice(0, startIdx);
  const after = c.slice(endIdx);

  const newSection = `        {/* ===== PARTICIPANT ACCORDION ===== */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {participants.length === 0 && (
              <div style={{ padding: '16px 14px', color: '#94A3B8', fontSize: 13 }}>
                {de ? 'Keine Teilnehmer.' : 'No participants.'}
              </div>
            )}
            {participants.map((p: any) => {
              const pDocs  = allDocs.filter((d: any) => d.participantId === p.id &&
                (!filterType || d.type === filterType));
              const isOpen = openPart === p.id;
              const total  = allDocs.filter((d: any) => d.participantId === p.id).length;
              const ok     = allDocs.filter((d: any) => d.participantId === p.id && d.status === 'doc_ready').length;
              const miss   = allDocs.filter((d: any) => d.participantId === p.id && (!d.status || d.status === 'doc_missing')).length;
              return (
                <div key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  {/* Accordion Header */}
                  <div
                    onClick={() => {
                      const next = isOpen ? null : p.id;
                      setOpenPart(next);
                      setFilterPart(next ?? '');
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 14px', cursor: 'pointer',
                      background: isOpen ? '#6D5DF608' : '#fff',
                      transition: 'background .15s',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: isOpen ? '#6D5DF6' : '#F1F5F9',
                      display: 'grid', placeItems: 'center',
                    }}>
                      <User size={16} color={isOpen ? '#fff' : '#64748B'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: isOpen ? '#6D5DF6' : '#1e293b' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, display: 'flex', gap: 8 }}>
                        <span>{total} {de ? 'Dokumente' : 'docs'}</span>
                        {total > 0 && <>
                          <span style={{ color: '#0FB6A0' }}>? {ok}</span>
                          <span style={{ color: '#F4475F' }}>? {miss}</span>
                        </>}
                      </div>
                    </div>
                    {isOpen
                      ? <ChevronDown size={15} color="#6D5DF6" />
                      : <ChevronRight size={15} color="#CBD5E1" />}
                  </div>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div style={{ background: '#FAFBFF', borderTop: '1px solid #F1F5F9' }}>
                      {pDocs.length === 0 ? (
                        <div style={{ padding: '14px 20px', color: '#94A3B8', fontSize: 13 }}>
                          {de ? 'Keine Dokumente.' : 'No documents yet.'}
                        </div>
                      ) : (
                        <div style={{ overflowX: 'auto' }}>

`;

  c = before + newSection + after;

  // Now close the accordion properly after the table
  // Find </div>\n        )}\n      </div> at end of table section
  const closeTable = "          </div>\n        )}\n      </div>";
  const closeIdx = c.indexOf(closeTable, endIdx);
  if (closeIdx > -1) {
    c = c.slice(0, closeIdx + closeTable.length) +
      "\n                      )}\n                    </div>\n                  )}\n                </div>\n              );\n            })}\n          </div>\n        )}" +
      c.slice(closeIdx + closeTable.length);
    console.log('Accordion closed OK');
  }

  console.log('Accordion inserted OK');
} else {
  console.log('Markers not found — startIdx:', startIdx, 'endIdx:', endIdx);
}

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

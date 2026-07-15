const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Remove QM_DOC special case - show docs normally
c = c.replace(
  "{filterType === 'QM_DOC' ? (\n                <div style={{ padding: 20, color: C.muted, fontSize: 13, textAlign: 'center' }}>{de ? 'QM-Dokumente werden im QM-Handbuch verwaltet.' : 'QM documents are managed in the QM Handbook section.'}<br/><button className='btn btn-ghost' style={{marginTop: 10}} onClick={() => { setCatModal(false); }}>Go to QM</button></div>\n              ) : ",
  "{"
);

// Remove filterType !== QM_DOC condition from map
c = c.replace(
  "{filterType !== 'QM_DOC' && allDocs.filter(d => d.type === filterType",
  "{allDocs.filter(d => d.type === filterType"
);

// Fix display name for QM docs - show title instead of participant name
c = c.replace(
  "                      <div style={{ fontSize: 13, fontWeight: 600 }}>{part ? part.name : d.responsible ? d.responsible : (measures.find((m) => m.id === d.measureId)?.name ?? typeLabel(d.type))}</div>",
  "                      <div style={{ fontSize: 13, fontWeight: 600 }}>{d._isQmDoc ? (d._qm?.titleDe && de ? d._qm.titleDe : d._qm?.title ?? d.responsible ?? typeLabel(d.type)) : part ? part.name : d.responsible ? d.responsible : (measures.find((m) => m.id === d.measureId)?.name ?? typeLabel(d.type))}</div>"
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

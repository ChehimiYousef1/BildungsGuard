const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');
const lines = c.split('\n');

const modal = [
  "      {viewDoc && (",
  "        <div onClick={() => setViewDoc(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>",
  "          <div onClick={(e) => e.stopPropagation()} className='card' style={{ width: '100%', maxWidth: 500, maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>",
  "            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #E2E8F0' }}>",
  "              <div style={{ fontWeight: 700, fontSize: 15 }}>{de ? (viewDoc.titleDe ?? viewDoc.title) : (viewDoc.title ?? viewDoc.titleDe)}</div>",
  "              <button onClick={() => setViewDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>",
  "            </div>",
  "            <div style={{ overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>",
  "              <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}><div style={{ fontSize: 12, color: C.muted, minWidth: 120 }}>{de ? 'Typ' : 'Type'}</div><div style={{ fontSize: 13, fontWeight: 500 }}>{typeLabel(viewDoc.type)}</div></div>",
  "              <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}><div style={{ fontSize: 12, color: C.muted, minWidth: 120 }}>Version</div><div style={{ fontSize: 13, fontWeight: 500 }}>{viewDoc.version ?? '-'}</div></div>",
  "              <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}><div style={{ fontSize: 12, color: C.muted, minWidth: 120 }}>{de ? 'Verantwortlich' : 'Owner'}</div><div style={{ fontSize: 13, fontWeight: 500 }}>{viewDoc.owner ?? '-'}</div></div>",
  "              <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}><div style={{ fontSize: 12, color: C.muted, minWidth: 120 }}>Status</div><div style={{ fontSize: 13, fontWeight: 500 }}>{viewDoc.status ?? '-'}</div></div>",
  "              {viewDoc.fileRef && <a href={viewDoc.fileRef} target='_blank' rel='noreferrer' style={{ color: C.iris, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Download size={14} />{de ? 'Datei herunterladen' : 'Download file'}</a>}",
  "            </div>",
  "            <div style={{ padding: '12px 18px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>",
  "              <button className='btn btn-ghost' onClick={() => { openEditDoc(viewDoc); setViewDoc(null); }} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Pencil size={13} /> {de ? 'Bearbeiten' : 'Edit'}</button>",
  "              <button className='btn btn-ghost' onClick={() => setViewDoc(null)}>{de ? 'Schliessen' : 'Close'}</button>",
  "            </div>",
  "          </div>",
  "        </div>",
  "      )}"
];

lines.splice(894, 0, ...modal);
c = lines.join('\n');
fs.writeFileSync('src/features/qm/QM.tsx', c, 'utf8');
console.log('DONE - total lines:', lines.length);

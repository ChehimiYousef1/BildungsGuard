const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');
const lines = c.split('\n');

// Find where viewDoc modal ends and insert edit modal after it
const viewDocEnd = lines.findIndex(l => l.includes("      )}") && lines.indexOf(l) > 894);
let insertAt = 0;
for (let i = 894; i < lines.length; i++) {
  if (lines[i] === "      )}") { insertAt = i + 1; break; }
}
console.log('Insert edit modal at line:', insertAt + 1);

const editModal = [
  "      {open && (",
  "        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>",
  "          <div onClick={(e) => e.stopPropagation()} className='card' style={{ width: '100%', maxWidth: 500, padding: 24 }}>",
  "            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>",
  "              <div style={{ fontWeight: 700, fontSize: 16 }}>{editId ? (de ? 'Dokument bearbeiten' : 'Edit document') : (de ? 'Neues Dokument' : 'New document')}</div>",
  "              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>",
  "            </div>",
  "            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>",
  "              <label style={lbl}>{de ? 'Titel' : 'Title'}<input value={form.title} onChange={(e) => set('title', e.target.value)} style={inp} /></label>",
  "              <label style={lbl}>{de ? 'Version' : 'Version'}<input value={form.version} onChange={(e) => set('version', e.target.value)} style={inp} placeholder='1.0' /></label>",
  "              <label style={lbl}>{de ? 'Verantwortlich' : 'Owner'}<input value={form.owner} onChange={(e) => set('owner', e.target.value)} style={inp} /></label>",
  "              <label style={lbl}>Status",
  "                <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inp}>",
  "                  <option value='doc_ready'>{de ? 'Gueltig' : 'Valid'}</option>",
  "                  <option value='inReview'>{de ? 'In Pruefung' : 'In review'}</option>",
  "                  <option value='draft'>{de ? 'Entwurf' : 'Draft'}</option>",
  "                </select>",
  "              </label>",
  "              <label style={lbl}>{de ? 'Inhalt' : 'Content'}<textarea value={form.content} onChange={(e) => set('content', e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' }} /></label>",
  "              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>",
  "                <button className='btn' style={{ padding: '9px 16px', background: '#F1F5F9', color: '#475569' }} onClick={() => setOpen(false)}>{de ? 'Abbrechen' : 'Cancel'}</button>",
  "                <button className='btn btn-primary' style={{ padding: '9px 18px' }} onClick={submitDoc}>{de ? 'Speichern' : 'Save'}</button>",
  "              </div>",
  "            </div>",
  "          </div>",
  "        </div>",
  "      )}"
];

lines.splice(insertAt, 0, ...editModal);
c = lines.join('\n');
fs.writeFileSync('src/features/qm/QM.tsx', c, 'utf8');
console.log('DONE - total lines:', lines.length);

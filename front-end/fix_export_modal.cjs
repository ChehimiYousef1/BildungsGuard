const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Find catModal header and add export button
c = c.replace(
  "              <button onClick={() => setCatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>",
  "              <button onClick={exportExcel} className=\"btn btn-ghost\" style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}><Download size={13} />{de ? 'Exportieren' : 'Export'}</button>\n              <button onClick={() => setCatModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>"
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

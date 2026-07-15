const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Replace the doc row in catModal to add per-participant export
c = c.replace(
  "                  <div key={d.id ?? i} onClick={() => { setCatModal(false); setSelDoc(d); }}\n                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',\n                      borderRadius: 9, border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer' }}>",
  "                  <div key={d.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, border: '1px solid #E2E8F0', background: '#fff' }}>\n                    <div onClick={() => { setCatModal(false); setSelDoc(d); }} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>"
);

// Add export button and close extra div after participant row content
c = c.replace(
  "                    <ChevronRight size={14} color=\"#CBD5E1\" />\n                  </div>",
  "                      <ChevronRight size={14} color=\"#CBD5E1\" />\n                    </div>\n                    <button onClick={(e) => { e.stopPropagation(); const rows = [{[de ? 'Teilnehmer' : 'Participant']: part?.name ?? '', [de ? 'Typ' : 'Type']: typeLabel(d.type), [de ? 'Status' : 'Status']: d.status ?? '', [de ? 'Datei' : 'File']: d.fileRef ?? ''}]; const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Doc'); XLSX.writeFile(wb, (part?.name ?? 'doc') + '.xlsx'); }} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 7, padding: '4px 8px', cursor: 'pointer', fontSize: 11, color: '#6D5DF6', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}><Download size={11} /></button>\n                  </div>"
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

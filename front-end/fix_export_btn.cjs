const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');
const lines = c.split('\n');

// Find the closing </div> of the participant row in catModal
// Look for the pattern: </span> followed by </div> inside catModal
let catModalStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('catModal && filterType')) { catModalStart = i; break; }
}

let found = 0;
for (let i = catModalStart; i < lines.length; i++) {
  if (lines[i].includes("STATUS_MAP[d.status] ? STATUS_MAP[d.status][lang] : d.status")) {
    // Insert export button after the span closing and before the div closing
    const spanClose = lines[i+1]; // </span>
    const divClose  = lines[i+2]; // </div>
    if (spanClose && spanClose.includes('</span>') && divClose && divClose.includes('</div>')) {
      const exportBtn = "                    <button onClick={(e) => { e.stopPropagation(); const rows = [{ Participant: part ? part.name : '-', Type: typeLabel(d.type), Status: d.status ?? '', Contact: part ? part.contact : '' }]; const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Export'); XLSX.writeFile(wb, (part ? part.name : 'doc') + '.xlsx'); }} style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 7, padding: '4px 8px', cursor: 'pointer', color: '#6D5DF6', display: 'flex', alignItems: 'center', flexShrink: 0 }}><Download size={12} /></button>";
      lines.splice(i + 2, 0, exportBtn);
      found++;
      console.log('Added export btn at line:', i + 3);
      break;
    }
  }
}

if (!found) console.log('Pattern not found');
c = lines.join('\n');
fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

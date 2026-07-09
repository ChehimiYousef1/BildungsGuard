const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Find return ( then find first card-head then add button
const retIdx = c.indexOf('  return (');
if (retIdx === -1) { console.log('return not found'); process.exit(); }

const headIdx = c.indexOf('card-head', retIdx);
if (headIdx === -1) { console.log('card-head not found'); process.exit(); }

// Find end of card-title div after card-head
const titleIdx = c.indexOf('card-title', headIdx);
const closeDivIdx = c.indexOf('</div>', titleIdx);
if (closeDivIdx === -1) { console.log('close div not found'); process.exit(); }

const btn = '\n          <button className="btn btn-ghost" style={{ padding: "7px 13px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }} onClick={exportExcel}><Download size={14} />{de ? "Exportieren" : "Export"}</button>';

c = c.slice(0, closeDivIdx + 6) + btn + c.slice(closeDivIdx + 6);
fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('Button added OK');

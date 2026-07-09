const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

const oldHeader = '<div className="card-head">';
const btnCode = ' <button className="btn btn-ghost" style={{ padding: "7px 13px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }} onClick={exportExcel}><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>{de ? "Exportieren" : "Export"}</button>';

const firstReturn = c.indexOf('  return (');
if (firstReturn > -1) {
  const cardHeadIdx = c.indexOf('<div className="card-head">', firstReturn);
  const closeIdx = c.indexOf('</div>', cardHeadIdx);
  if (closeIdx > -1) {
    c = c.slice(0, closeIdx) + btnCode + c.slice(closeIdx);
    console.log('Export button added OK');
  } else { console.log('close div not found'); }
} else { console.log('return not found'); }

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

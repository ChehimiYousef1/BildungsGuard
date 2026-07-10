const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');

// Find audit tab content and replace with AuditPage component
const auditTabStart = c.indexOf("{tab === 'audit' && (");
const auditTabEnd = c.indexOf('{tab ===', auditTabStart + 10);

if (auditTabStart > -1 && auditTabEnd > -1) {
  const newAuditTab = "{tab === 'audit' && <AuditPage />}\n\n      ";
  c = c.slice(0, auditTabStart) + newAuditTab + c.slice(auditTabEnd);
  console.log('Audit tab replaced with AuditPage component');
} else {
  console.log('Audit tab not found:', auditTabStart, auditTabEnd);
}

fs.writeFileSync('src/features/qm/QM.tsx', c, 'utf8');
console.log('DONE');

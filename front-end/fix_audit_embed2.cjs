const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');

const auditTabStart = c.indexOf("{tab === 'audit' && (");
if (auditTabStart === -1) { console.log('Not found'); process.exit(1); }

// Find the closing of the audit tab block
// Look for the closing )} of the last tab
const closingReturn = c.indexOf('\n    </>\n  );\n}', auditTabStart);
console.log('auditTabStart:', auditTabStart, 'closingReturn:', closingReturn);

if (closingReturn > -1) {
  const auditBlock = c.slice(auditTabStart, closingReturn);
  console.log('Audit block length:', auditBlock.length);
  c = c.slice(0, auditTabStart) + "{tab === 'audit' && <AuditPage />}" + c.slice(closingReturn);
  console.log('Replaced OK');
}

fs.writeFileSync('src/features/qm/QM.tsx', c, 'utf8');
console.log('DONE');

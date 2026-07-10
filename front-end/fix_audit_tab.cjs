const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');

// Add Audit import
if (!c.includes("import Audit from")) {
  c = c.replace(
    "import { AUDIT_HIST }",
    "import AuditPage from '../audit/Audit';\nimport { AUDIT_HIST }"
  );
  console.log('Import added');
}

fs.writeFileSync('src/features/qm/QM.tsx', c, 'utf8');
console.log('DONE');

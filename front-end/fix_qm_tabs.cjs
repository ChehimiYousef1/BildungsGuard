const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');

// Remove audit from TABS array
c = c.replace(
  "    { id: 'audit',        label: 'Audits',                             icon: <BadgeCheck     size={13} />",
  "    // audit tab moved to sidebar"
);

// Remove AuditPage line
c = c.replace(
  "      {tab === 'audit' && <AuditPage />}",
  ""
);

// Remove AuditPage import
c = c.replace(
  "import AuditPage from '../audit/Audit';\n",
  ""
);

fs.writeFileSync('src/features/qm/QM.tsx', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// Show all completed participants not just ones with measureId
c = c.replace(
  "const completed = partList.filter((p) =>\n        p.status === 'completed' || p.status === 'abgeschlossen'\n      );",
  "const completed = partList.filter((p) =>\n        p.status === 'completed' || p.status === 'abgeschlossen' || p.status === 'dropped'\n      );"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

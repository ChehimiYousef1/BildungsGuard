const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

c = c.replace(
  "        setMeasures(measWithParts);",
  "        setMeasures(measWithParts);\n        console.log('[Assignment] measures with parts:', measWithParts.map(m => m.name));\n        console.log('[Assignment] all parts:', partList.map(p => ({name:p.name,measureId:p.measureId})));"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

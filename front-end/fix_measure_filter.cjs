const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Filter measures to only those that have participants
c = c.replace(
  "        setMeasures(Array.isArray(meas) ? meas : []);const _data = data;",
  "        const measList = Array.isArray(meas) ? meas : [];\n        const partList = Array.isArray(data) ? data : [];\n        // Only show measures that have participants\n        const measWithParts = measList.filter(m => partList.some(p => p.measureId === m.id));\n        setMeasures(measWithParts);\n        // Auto-select first measure if only one\n        if (measWithParts.length === 1) setSelMeasure(measWithParts[0].id);\n        const _data = data;"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

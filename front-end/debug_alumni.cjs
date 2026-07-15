const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// Add debug log after setAlumni
c = c.replace(
  "setMeasures(measureList);",
  "setMeasures(measureList);\n      console.log('[measures]', measureList.map((m) => ({id: m.id, name: m.name})));"
);

c = c.replace(
  "setAlumni(list);",
  "setAlumni(list);\n      console.log('[alumni sample]', list[0]);"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

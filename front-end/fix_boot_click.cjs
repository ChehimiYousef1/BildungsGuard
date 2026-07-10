const fs = require('fs');
let c = fs.readFileSync('src/features/attendance/Sessions.tsx', 'utf8');

c = c.replace(
  "() => setStatsModal({ title: de ? 'Bootcamps' : 'Bootcamps', items: measures.map(m => tMeasure(m)) })",
  "() => { console.log('measures:', measures.length); setStatsModal({ title: de ? 'Bootcamps' : 'Bootcamps', items: measures.length > 0 ? measures.map((m: any) => tMeasure(m)) : ['No data'] }); }"
);

fs.writeFileSync('src/features/attendance/Sessions.tsx', c, 'utf8');
console.log('DONE');

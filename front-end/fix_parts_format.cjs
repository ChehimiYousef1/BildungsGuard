const fs = require('fs');
let c = fs.readFileSync('src/features/attendance/Sessions.tsx', 'utf8');

c = c.replace(
  "() => setStatsModal({ title: de ? 'Teilnehmer' : 'Participants', items: allParts.map((p: any) => p.name + (p.contact ? ' \u2014 ' + p.contact : '')) })",
  "() => setStatsModal({ title: de ? 'Teilnehmer' : 'Participants', items: allParts.map((p: any) => p.name + (p.contact ? ' : ' + p.contact : '')) })"
);

fs.writeFileSync('src/features/attendance/Sessions.tsx', c, 'utf8');
console.log('DONE');

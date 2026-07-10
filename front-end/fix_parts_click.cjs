const fs = require('fs');
let c = fs.readFileSync('src/features/attendance/Sessions.tsx', 'utf8');

c = c.replace(
  "[<Users size={13} />,         totalParts,       de ? 'Teilnehmer' : 'Participants', C.iris,  null],",
  "[<Users size={13} />,         totalParts,       de ? 'Teilnehmer' : 'Participants', C.iris,  () => { const parts: string[] = []; Object.entries(partsByMeas).forEach(([mId, count]) => { const m = measures.find((x: any) => x.id === mId); if (m && count > 0) parts.push(tMeasure(m) + ': ' + count + (de ? ' TN' : ' participants')); }); setStatsModal({ title: de ? 'Teilnehmer' : 'Participants', items: parts }); }],"
);

fs.writeFileSync('src/features/attendance/Sessions.tsx', c, 'utf8');
console.log('DONE');

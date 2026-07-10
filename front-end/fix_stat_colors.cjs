const fs = require('fs');
let c = fs.readFileSync('src/features/attendance/Sessions.tsx', 'utf8');

c = c.replace(
  "[<Users size={13} />,         totalParts,       de ? 'Teilnehmer' : 'Participants', C.iris,",
  "[<Users size={13} />,         totalParts,       de ? 'Teilnehmer' : 'Participants', '#3B82F6',"
);

fs.writeFileSync('src/features/attendance/Sessions.tsx', c, 'utf8');
console.log('DONE');

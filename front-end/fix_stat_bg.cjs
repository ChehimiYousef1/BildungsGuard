const fs = require('fs');
let c = fs.readFileSync('src/features/attendance/Sessions.tsx', 'utf8');

// Replace color+'12' with explicit hex backgrounds
c = c.replace(
  "background: color + '12', cursor: onClick ? 'pointer' : 'default'",
  "background: color + '15', border: '1px solid ' + color + '30', cursor: onClick ? 'pointer' : 'default'"
);

// Fix Bootcamps color to explicit hex
c = c.replace(
  "de ? 'Bootcamps'  : 'Bootcamps',    C.iris,",
  "de ? 'Bootcamps'  : 'Bootcamps',    '#6D5DF6',"
);

// Fix Participants color  
c = c.replace(
  "de ? 'Teilnehmer' : 'Participants', '#3B82F6',",
  "de ? 'Teilnehmer' : 'Participants', '#3B82F6',"
);

// Fix Courses color
c = c.replace(
  "de ? 'Kurse'      : 'Courses',      C.amber,",
  "de ? 'Kurse'      : 'Courses',      '#F59E0B',"
);

// Fix Sessions color
c = c.replace(
  "de ? 'Sitzungen'  : 'Sessions',     C.mint,",
  "de ? 'Sitzungen'  : 'Sessions',     '#0FB6A0',"
);

fs.writeFileSync('src/features/attendance/Sessions.tsx', c, 'utf8');
console.log('DONE');

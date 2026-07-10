const fs = require('fs');
let c = fs.readFileSync('src/features/attendance/Sessions.tsx', 'utf8');

c = c.replace(
  'onClick={onClick || undefined}',
  'onClick={onClick ? () => onClick() : undefined}'
);

fs.writeFileSync('src/features/attendance/Sessions.tsx', c, 'utf8');
console.log('DONE');

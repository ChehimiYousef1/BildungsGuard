const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

c = c.split(
  "await fetch('/api/v1/quiz/' + q.id + '/attempts/' + pid"
).join(
  "await fetch('http://localhost:3000/api/v1/quiz/' + q.id + '/attempts/' + pid"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

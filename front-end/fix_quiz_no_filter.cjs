const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Learn.tsx', 'utf8');

c = c.replace(
  "        const qUrl = mId ? '/quiz?measureId=' + mId : '/quiz';",
  "        const qUrl = '/quiz';"
);

fs.writeFileSync('src/features/portals/participant/Learn.tsx', c, 'utf8');
console.log('DONE');

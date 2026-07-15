const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Progress.tsx', 'utf8');

c = c.replace(
  "api<any[]>('/courses').catch(() => [])",
  "api<any[]>(me.measureId ? '/courses?measureId=' + me.measureId : '/courses').catch(() => [])"
);

fs.writeFileSync('src/features/portals/participant/Progress.tsx', c, 'utf8');
console.log('DONE');

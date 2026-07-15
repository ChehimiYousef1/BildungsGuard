const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Add debug log in JSX
c = c.replace(
  "                    const s      = getScore(p.id, a);",
  "                    const s      = getScore(p.id, a);\n                    if (p.id === 'cmrjtx8ku0001cdu9eqxzorm6') console.log('[JSX getScore] samer:', s, '| a.title:', a.title, '| grades:', grades[p.id]?.length);"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

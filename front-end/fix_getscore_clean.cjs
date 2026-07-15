const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Find and replace the entire getScore function
const start = c.indexOf('  const getScore =');
const end = c.indexOf('\n  const getPct', start);

if (start > -1 && end > -1) {
  const newFn = `  const getScore = (pid: string, a: Assignment) => {
    const all = grades[pid] ?? [];
    if (all.length === 0) return null;
    const exact = all.find((t) => t.title === a.title);
    if (exact) return exact;
    return all.reduce((best: any, curr: any) => {
      const bPct = best?.score ? parseInt(best.score) : 0;
      const cPct = curr?.score ? parseInt(curr.score) : 0;
      return cPct > bPct ? curr : best;
    }, all[0]);
  };`;
  c = c.slice(0, start) + newFn + c.slice(end);
  console.log('getScore replaced OK');
}

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

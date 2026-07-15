const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Certificates.tsx', 'utf8');

// Replace average calculation with last grade calculation
c = c.replace(
  `  const scoredList = grades
    .map((gr) => pct(gr.score))
    .filter((x): x is number => x !== null);

  const total = scoredList.length > 0
    ? Math.round(scoredList.reduce((a, b) => a + b, 0) / scoredList.length)
    : null;
  const passed = total !== null && total >= PASS_MARK;
  const hasGrades = scoredList.length > 0;`,
  `  // Sort by createdAt descending, take the last attempt only
  const sortedGrades = [...grades].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const lastGrade = sortedGrades[0];
  const lastPct   = lastGrade ? pct(lastGrade.score) : null;

  const scoredList = grades
    .map((gr) => pct(gr.score))
    .filter((x): x is number => x !== null);

  const total   = lastPct;
  const passed  = total !== null && total >= PASS_MARK;
  const hasGrades = scoredList.length > 0;`
);

fs.writeFileSync('src/features/portals/participant/Certificates.tsx', c, 'utf8');
console.log('DONE');

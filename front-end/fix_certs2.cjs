const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Certificates.tsx', 'utf8');

// Replace scoredList to use all grades directly
c = c.replace(
  "  const scoredList = assignments\n    .map((a) => {\n      const g = grades.find((gr) => gr.title === a.title);\n      return g?.score ? pct(g.score) : null;\n    })\n    .filter((x): x is number => x !== null);",
  "  const scoredList = grades\n    .map((gr) => pct(gr.score))\n    .filter((x): x is number => x !== null);"
);

fs.writeFileSync('src/features/portals/participant/Certificates.tsx', c, 'utf8');
console.log('DONE - scoredList uses all grades:', c.includes('grades\n    .map((gr) => pct(gr.score))'));

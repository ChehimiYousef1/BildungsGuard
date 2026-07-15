const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Progress.tsx', 'utf8');

// Fix gradedAssignments to show all grades directly
c = c.replace(
  "  const gradedAssignments = assignments.map((a) => {\n    const g = grades.find((gr) => gr.title === a.title) ?? null;\n    const p = g?.score ? pct(g.score) : null;\n    return { ...a, grade: g, pct: p, passed: p !== null && p >= PASS_MARK };\n  });",
  "  // Show all actual grades from surveys\n  const gradedAssignments = grades.map((g) => ({\n    id: g.id,\n    title: g.title ?? 'Exam',\n    maxScore: 100,\n    grade: g,\n    pct: pct(g.score),\n    passed: pct(g.score) !== null && (pct(g.score) ?? 0) >= PASS_MARK,\n  }));"
);

fs.writeFileSync('src/features/portals/participant/Progress.tsx', c, 'utf8');
console.log('DONE');

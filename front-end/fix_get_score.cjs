const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

c = c.replace(
  "  const getScore = (pid: string, a: Assignment) => {\n    const all = grades[pid] ?? [];\n    // First try exact title match, then fall back to latest grade\n    return all.find((t) => t.title === a.title) ?? (all.length > 0 ? all[all.length - 1] : null);\n  };",
  "  const getScore = (pid: string, a: Assignment) => {\n    const all = grades[pid] ?? [];\n    if (all.length === 0) return null;\n    // Try exact match first\n    const exact = all.find((t) => t.title === a.title);\n    if (exact) return exact;\n    // Return best score\n    return all.reduce((best, curr) => {\n      const bPct = best?.score ? parseInt(best.score) : 0;\n      const cPct = curr?.score ? parseInt(curr.score) : 0;\n      return cPct > bPct ? curr : best;\n    }, all[0]);\n  };"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

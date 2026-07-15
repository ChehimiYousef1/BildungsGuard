const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Fix getScore to return latest grade for participant regardless of title
c = c.replace(
  "  const getScore = (pid: string, a: Assignment) =>\n    (grades[pid] ?? []).find((t) => t.title === a.title) ?? null;",
  "  const getScore = (pid: string, a: Assignment) => {\n    const all = grades[pid] ?? [];\n    // First try exact title match, then fall back to latest grade\n    return all.find((t) => t.title === a.title) ?? (all.length > 0 ? all[all.length - 1] : null);\n  };"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

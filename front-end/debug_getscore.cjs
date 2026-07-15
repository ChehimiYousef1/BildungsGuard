const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

c = c.replace(
  "  const getScore = (pid: string, a: Assignment) => {",
  "  const getScore = (pid: string, a: Assignment) => {\n    const result = (() => {"
);

c = c.replace(
  "  };\n\n  const getPct",
  "    })();\n    if (result) console.log('[getScore]', pid, a.title, '->', result.score);\n    return result;\n  };\n\n  const getPct"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

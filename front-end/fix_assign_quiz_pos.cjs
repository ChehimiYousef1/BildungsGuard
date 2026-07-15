const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');
const lines = c.split('\n');

// Remove the misplaced api('/quiz') line at line 68 (index 67)
if (lines[67].includes("api('/quiz')")) {
  lines.splice(67, 1);
  console.log('Removed misplaced quiz line');
}

// Find setLoading(false) or setParts([]) and add quiz fetch after the catch block closes
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('}, []); // refresh on mount')) {
    lines.splice(i, 0, "  // load quizzes");
    lines.splice(i + 1, 0, "  api('/quiz').then((q: any) => setQuizzes(Array.isArray(q) ? q : [])).catch(() => {});");
    console.log('Inserted quiz fetch at line:', i + 1);
    break;
  }
}

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', lines.join('\n'), 'utf8');
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Load all quiz attempts on mount after quizzes are loaded
c = c.replace(
  "  api('/quiz').then((q: any) => setQuizzes(Array.isArray(q) ? q : [])).catch(() => {});",
  "  api('/quiz').then(async (q: any) => {\n    const list = Array.isArray(q) ? q : [];\n    setQuizzes(list);\n    // Auto-load attempts for all quizzes\n    const attMap = {};\n    await Promise.all(list.map(async (quiz) => {\n      const att = await api('/quiz/' + quiz.id + '/attempts').catch(() => []);\n      attMap[quiz.id] = Array.isArray(att) ? att : [];\n    }));\n    setQuizAttempts(attMap);\n  }).catch(() => {});"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

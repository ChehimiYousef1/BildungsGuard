const fs = require('fs');

// 1. QuizPlayer - set flag after submit
let q = fs.readFileSync('src/features/portals/participant/QuizPlayer.tsx', 'utf8');
q = q.replace(
  "      setResult(res);",
  "      localStorage.setItem('quiz_grade_updated', '1');\n      setResult(res);"
);
fs.writeFileSync('src/features/portals/participant/QuizPlayer.tsx', q, 'utf8');
console.log('QuizPlayer fixed');

// 2. Progress.tsx - reload when flag is set
let p = fs.readFileSync('src/features/portals/participant/Progress.tsx', 'utf8');

// Add reload trigger in useEffect
p = p.replace(
  "  }, [me?.id, meLoading]);",
  "  }, [me?.id, meLoading]);\n\n  // Reload grades after quiz completion\n  useEffect(() => {\n    const flag = localStorage.getItem('quiz_grade_updated');\n    if (!flag || !me?.id) return;\n    localStorage.removeItem('quiz_grade_updated');\n    api('/surveys?participantId=' + me.id).catch(() => [])\n      .then((s: any) => setGrades((Array.isArray(s) ? s : []).filter((x: any) => x.type === 'test')));\n  }, [me?.id]);"
);

fs.writeFileSync('src/features/portals/participant/Progress.tsx', p, 'utf8');
console.log('Progress fixed');
console.log('DONE');

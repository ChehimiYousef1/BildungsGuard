const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Learn.tsx', 'utf8');

// Check if quiz fetch was added
console.log('Has quiz fetch:', c.includes("api('/quiz"));
console.log('Has setLoading:', c.includes('setLoading(false)'));

// Add debug log
c = c.replace(
  "api('/quiz').then((q: any) => setQuizzes(Array.isArray(q) ? q : [])).catch(() => {});",
  "api('/quiz').then((q: any) => { console.log('[Learn] quizzes:', q); setQuizzes(Array.isArray(q) ? q : []); }).catch((e: any) => console.error('[Learn] quiz error:', e));"
);

c = c.replace(
  "api('/quiz?measureId=' + me.measureId).then((q: any) => setQuizzes(Array.isArray(q) ? q : [])).catch(() => {});",
  "api('/quiz?measureId=' + me.measureId).then((q: any) => { console.log('[Learn] quizzes by measure:', q); setQuizzes(Array.isArray(q) ? q : []); }).catch((e: any) => console.error('[Learn] quiz error:', e));"
);

fs.writeFileSync('src/features/portals/participant/Learn.tsx', c, 'utf8');
console.log('DONE');

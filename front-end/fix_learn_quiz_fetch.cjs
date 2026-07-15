const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Learn.tsx', 'utf8');

// Add quiz fetch before the catch block
c = c.replace(
  "      } catch (e) { console.error('[Learn] load failed', e); }",
  "        // Load quizzes\n        const mId = me.measureId ?? me.measure?.id;\n        const qUrl = mId ? '/quiz?measureId=' + mId : '/quiz';\n        api(qUrl).then((q: any) => { console.log('[Learn] quizzes:', q); setQuizzes(Array.isArray(q) ? q : []); }).catch(() => {});\n      } catch (e) { console.error('[Learn] load failed', e); }"
);

fs.writeFileSync('src/features/portals/participant/Learn.tsx', c, 'utf8');
console.log('DONE - has quiz fetch:', c.includes("api(qUrl)"));

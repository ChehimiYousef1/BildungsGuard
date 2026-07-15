const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/QuizModal.tsx', 'utf8');

c = c.replace(
  "      const form = new FormData();\n      form.append('file', importFile);\n      await fetch(`http://localhost:3000/api/v1/quiz/${quiz.id}/import`, {\n        method: 'POST',\n        headers: { Authorization: `Bearer ${getToken()}` },\n        body: form,\n      });",
  "      const form = new FormData();\n      form.append('file', importFile);\n      const importRes = await fetch(`http://localhost:3000/api/v1/quiz/${quiz.id}/import`, {\n        method: 'POST',\n        headers: { Authorization: `Bearer ${getToken()}` },\n        body: form,\n      });\n      console.log('[Quiz Import] status:', importRes.status);\n      if (!importRes.ok) { const err = await importRes.text(); console.error('[Quiz Import] error:', err); throw new Error('Import failed: ' + importRes.status); }"
);

fs.writeFileSync('src/features/portals/trainer/QuizModal.tsx', c, 'utf8');
console.log('DONE');

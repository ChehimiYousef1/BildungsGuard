const fs = require('fs');
let c = fs.readFileSync('src/quiz/quiz.service.ts', 'utf8');

c = c.replace(
  "if (participant) {",
  "console.log('[Alumni] participant found:', participant?.name, '| measureId:', (participant as any)?.measureId);\n        if (participant) {"
);

c = c.replace(
  "console.log('[Quiz] auto-alumni created for:', participant.name);",
  "console.log('[Quiz] auto-alumni created for:', participant.name);"
);

c = c.replace(
  "} catch(e: any) { console.error('[Quiz] auto-alumni FAILED:', e.message); }",
  "} catch(e: any) { console.error('[Quiz] auto-alumni FAILED:', e.message, e.stack); }"
);

fs.writeFileSync('src/quiz/quiz.service.ts', c, 'utf8');
console.log('DONE');

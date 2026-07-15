const fs = require('fs');
let c = fs.readFileSync('src/quiz/quiz.controller.ts', 'utf8');

c = c.replace(
  "  ) {\n    return this.service.importFromExcel(t, id, file);",
  "  ) {\n    console.log('[Quiz Import] tenantId:', t, '| id:', id, '| file:', file?.originalname);\n    return this.service.importFromExcel(t, id, file);"
);

fs.writeFileSync('src/quiz/quiz.controller.ts', c, 'utf8');
console.log('DONE');

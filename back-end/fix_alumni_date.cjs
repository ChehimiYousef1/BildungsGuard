const fs = require('fs');
let c = fs.readFileSync('src/quiz/quiz.service.ts', 'utf8');
c = c.replace(
  "graduatedAt: new Date(),",
  "graduatedAt: new Date().toLocaleDateString('de-DE'),"
);
fs.writeFileSync('src/quiz/quiz.service.ts', c, 'utf8');
console.log('DONE');

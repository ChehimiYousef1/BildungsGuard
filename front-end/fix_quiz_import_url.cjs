const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/QuizModal.tsx', 'utf8');

c = c.replace(
  "await fetch(`/api/v1/quiz/${quiz.id}/import`, {",
  "await fetch(`http://localhost:3000/api/v1/quiz/${quiz.id}/import`, {"
);

fs.writeFileSync('src/features/portals/trainer/QuizModal.tsx', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

c = c.replace(
  "            Quizzes ({quizzes.length})",
  "            {de ? 'Quizzes' : 'Quizzes'} ({quizzes.length})"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

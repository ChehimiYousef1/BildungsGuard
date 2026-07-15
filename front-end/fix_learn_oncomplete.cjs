const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Learn.tsx', 'utf8');

c = c.replace(
  "<QuizPlayer quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={() => setActiveQuiz(null)} />",
  "<QuizPlayer quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={(_r: any) => {}} />"
);

fs.writeFileSync('src/features/portals/participant/Learn.tsx', c, 'utf8');
console.log('DONE');

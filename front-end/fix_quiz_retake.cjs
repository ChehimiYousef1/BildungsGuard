const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Learn.tsx', 'utf8');

// Add attempt counter state
c = c.replace(
  "  const [activeQuiz, setActiveQuiz] = useState<any>(null);",
  "  const [activeQuiz,  setActiveQuiz]  = useState<any>(null);\n  const [quizAttempt, setQuizAttempt] = useState(0);"
);

// Reset attempt on open
c = c.replace(
  "onClick={() => setActiveQuiz(q)}",
  "onClick={() => { setActiveQuiz(q); setQuizAttempt(a => a + 1); }}"
);

// Add key to QuizPlayer so it resets on each attempt
c = c.replace(
  "<QuizPlayer quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={(_r: any) => {}} />",
  "<QuizPlayer key={activeQuiz?.id + '-' + quizAttempt} quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={(_r: any) => {}} />"
);

fs.writeFileSync('src/features/portals/participant/Learn.tsx', c, 'utf8');
console.log('DONE');

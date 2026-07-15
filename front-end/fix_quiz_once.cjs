const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Learn.tsx', 'utf8');

// 1. Remove attempt counter state
c = c.replace(
  "  const [activeQuiz,  setActiveQuiz]  = useState<any>(null);\n  const [quizAttempt, setQuizAttempt] = useState(0);",
  "  const [activeQuiz,  setActiveQuiz]  = useState<any>(null);\n  const [doneQuizIds, setDoneQuizIds]  = useState<Set<string>>(new Set());"
);

// 2. Mark quiz as done after submit in QuizPlayer onComplete
c = c.replace(
  "onComplete={(_r: any) => {}}",
  "onComplete={(_r: any) => { setDoneQuizIds(s => new Set([...s, activeQuiz?.id])); }}"
);

// 3. Remove attempt counter from onClick
c = c.replace(
  "onClick={() => { setActiveQuiz(q); setQuizAttempt(a => a + 1); }}",
  "onClick={() => setActiveQuiz(q)}"
);

// 4. Remove key with attempt counter
c = c.replace(
  "<QuizPlayer key={activeQuiz?.id + '-' + quizAttempt}",
  "<QuizPlayer key={activeQuiz?.id}"
);

// 5. Disable Start button if quiz already done
c = c.replace(
  "<button className=\"btn btn-primary\" style={{ padding: '7px 16px', fontSize: 12 }} onClick={() => setActiveQuiz(q)}>{lang === 'de' ? 'Starten' : 'Start'}</button>",
  "<button className=\"btn btn-primary\" style={{ padding: '7px 16px', fontSize: 12, opacity: doneQuizIds.has(q.id) ? 0.5 : 1 }} disabled={doneQuizIds.has(q.id)} onClick={() => !doneQuizIds.has(q.id) && setActiveQuiz(q)}>{doneQuizIds.has(q.id) ? (lang === 'de' ? 'Erledigt ?' : 'Done ?') : (lang === 'de' ? 'Starten' : 'Start')}</button>"
);

fs.writeFileSync('src/features/portals/participant/Learn.tsx', c, 'utf8');
console.log('DONE');

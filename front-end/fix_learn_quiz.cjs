const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Learn.tsx', 'utf8');

// 1. Import QuizPlayer
if (!c.includes('QuizPlayer')) {
  c = c.replace(
    "import { api } from '../../../lib/api';",
    "import { api } from '../../../lib/api';\nimport QuizPlayer from './QuizPlayer';"
  );
}

// 2. Add quizzes state
c = c.replace(
  "  const [loading, setLoading] = useState(true);",
  "  const [loading, setLoading] = useState(true);\n  const [quizzes, setQuizzes] = useState<any[]>([]);\n  const [activeQuiz, setActiveQuiz] = useState<any>(null);"
);

// 3. Fetch quizzes in useEffect
c = c.replace(
  "      setLoading(false);",
  "      // Load quizzes for this bootcamp\n      if (me?.measureId) {\n        api('/quiz?measureId=' + me.measureId).then((q: any) => setQuizzes(Array.isArray(q) ? q : [])).catch(() => {});\n      }\n      setLoading(false);"
);

// 4. Add quiz section in JSX — insert before last closing div of content
const quizSection = `
      {/* ===== QUIZ SECTION ===== */}
      {quizzes.length > 0 && (
        <div className='card' style={{ marginTop: 16 }}>
          <div className='card-head'>
            <div className='card-title'>?? {lang === 'de' ? 'Quiz & Tests' : 'Quizzes & Tests'}</div>
          </div>
          <div style={{ padding: '0 8px 12px' }}>
            {quizzes.map((q: any) => (
              <div key={q.id} onClick={() => setActiveQuiz(q)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 9, background: '#F8FAFF', marginBottom: 8,
                  cursor: 'pointer', border: '1px solid #E8EEFF' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{q.title}</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                    {q.questions?.length ?? 0} {lang === 'de' ? 'Fragen' : 'questions'}
                    {q.timeLimit ? ' · ' + q.timeLimit + (lang === 'de' ? ' Min.' : ' min') : ''}
                  </div>
                </div>
                <button className='btn btn-primary' style={{ padding: '7px 16px', fontSize: 12 }}>
                  {lang === 'de' ? 'Starten' : 'Start'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeQuiz && (
        <QuizPlayer
          quiz={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onComplete={() => setActiveQuiz(null)}
        />
      )}`;

// Insert before last </> in return
const lastClose = c.lastIndexOf('    </>\n  );\n}');
if (lastClose > -1) {
  c = c.slice(0, lastClose) + quizSection + '\n' + c.slice(lastClose);
}

fs.writeFileSync('src/features/portals/participant/Learn.tsx', c, 'utf8');
console.log('DONE');

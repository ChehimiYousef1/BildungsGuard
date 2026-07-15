const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Learn.tsx', 'utf8');
const lines = c.split('\n');

// 1. Add quizzes state after first useState
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('useState') && lines[i].includes('loading')) {
    lines.splice(i + 1, 0,
      "  const [quizzes,    setQuizzes]    = useState<any[]>([]);",
      "  const [activeQuiz, setActiveQuiz] = useState<any>(null);"
    );
    console.log('States added at line:', i + 2);
    break;
  }
}

// 2. Add quiz fetch after setLoading(false) in useEffect
const newLines = lines.join('\n');
let c2 = newLines.replace(
  "      setLoading(false);",
  "      // Load quizzes for this bootcamp\n      if (me?.measureId) {\n        api('/quiz?measureId=' + me.measureId).then((q: any) => setQuizzes(Array.isArray(q) ? q : [])).catch(() => {});\n      } else {\n        api('/quiz').then((q: any) => setQuizzes(Array.isArray(q) ? q : [])).catch(() => {});\n      }\n      setLoading(false);"
);

// 3. Add quiz section before last </> in return
const lastClose = c2.lastIndexOf('    </>\n  );\n}');
if (lastClose > -1) {
  const quizSection = `
      {/* ===== QUIZ SECTION ===== */}
      {quizzes.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-head">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>??</span>
              {lang === 'de' ? 'Quiz & Tests' : 'Quizzes & Tests'}
              <span style={{ marginLeft: 4, fontSize: 11, background: '#6D5DF618', color: '#6D5DF6', borderRadius: 20, padding: '1px 7px' }}>{quizzes.length}</span>
            </div>
          </div>
          <div style={{ padding: '0 8px 12px' }}>
            {quizzes.map((q: any) => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 9, background: '#F8FAFF', marginBottom: 8, border: '1px solid #E8EEFF' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{q.title}</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                    {q.questions?.length ?? 0} {lang === 'de' ? 'Fragen' : 'questions'}
                    {q.timeLimit ? ' · ' + q.timeLimit + (lang === 'de' ? ' Min.' : ' min') : ''}
                  </div>
                </div>
                <button className="btn btn-primary" style={{ padding: '7px 16px', fontSize: 12 }} onClick={() => setActiveQuiz(q)}>
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
  c2 = c2.slice(0, lastClose) + quizSection + '\n' + c2.slice(lastClose);
  console.log('Quiz section added');
}

fs.writeFileSync('src/features/portals/participant/Learn.tsx', c2, 'utf8');
console.log('DONE');

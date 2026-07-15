const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Learn.tsx', 'utf8');
const lines = c.split('\n');

// Find last </div> before );
let insertAt = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() === '</div>' && lines[i+1] && lines[i+1].trim() === ');') {
    insertAt = i;
    break;
  }
}
console.log('Insert at line:', insertAt + 1);

if (insertAt > -1) {
  const section = [
    "      {/* ===== QUIZ SECTION ===== */}",
    "      {quizzes.length > 0 && (",
    "        <div className=\"card\" style={{ marginTop: 16 }}>",
    "          <div className=\"card-head\">",
    "            <div className=\"card-title\" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>",
    "              <span style={{ fontSize: 16 }}>??</span>",
    "              {lang === 'de' ? 'Quiz & Tests' : 'Quizzes & Tests'}",
    "              <span style={{ marginLeft: 4, fontSize: 11, background: '#6D5DF618', color: '#6D5DF6', borderRadius: 20, padding: '1px 7px' }}>{quizzes.length}</span>",
    "            </div>",
    "          </div>",
    "          <div style={{ padding: '0 8px 12px' }}>",
    "            {quizzes.map((q: any) => (",
    "              <div key={q.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 9, background: '#F8FAFF', marginBottom: 8, border: '1px solid #E8EEFF' }}>",
    "                <div>",
    "                  <div style={{ fontWeight: 600, fontSize: 13 }}>{q.title}</div>",
    "                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{q.questions?.length ?? 0} {lang === 'de' ? 'Fragen' : 'questions'}{q.timeLimit ? ' · ' + q.timeLimit + (lang === 'de' ? ' Min.' : ' min') : ''}</div>",
    "                </div>",
    "                <button className=\"btn btn-primary\" style={{ padding: '7px 16px', fontSize: 12 }} onClick={() => setActiveQuiz(q)}>{lang === 'de' ? 'Starten' : 'Start'}</button>",
    "              </div>",
    "            ))}",
    "          </div>",
    "        </div>",
    "      )}",
    "      {activeQuiz && (",
    "        <QuizPlayer quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={() => setActiveQuiz(null)} />",
    "      )}"
  ];
  lines.splice(insertAt, 0, ...section);
  console.log('Section inserted');
}

fs.writeFileSync('src/features/portals/participant/Learn.tsx', lines.join('\n'), 'utf8');
console.log('DONE');

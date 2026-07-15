const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');
const lines = c.split('\n');

// Find last </div> before );
let insertAt = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes('showQuizModal') && lines[i].includes('{showQuizModal')) {
    insertAt = i;
    break;
  }
}
console.log('Insert before line:', insertAt + 1);

const quizSection = [
  "      {/* Quiz list */}",
  "      {quizzes.length > 0 && (",
  "        <div className='card' style={{ marginTop: 16, padding: '18px 16px' }}>",
  "          <div className='card-title' style={{ marginBottom: 12 }}>?? {de ? 'Quizzes' : 'Quizzes'} ({quizzes.length})</div>",
  "          {quizzes.map((q: any) => (",
  "            <div key={q.id} style={{ padding: '10px 14px', borderRadius: 9, background: '#F8FAFF', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>",
  "              <div>",
  "                <div style={{ fontWeight: 600, fontSize: 13 }}>{q.title}</div>",
  "                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{q.questions?.length ?? 0} {de ? 'Fragen' : 'questions'} · {q._count?.attempts ?? 0} {de ? 'Versuche' : 'attempts'}</div>",
  "              </div>",
  "              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>",
  "                <span style={{ fontSize: 11, color: '#6D5DF6', fontWeight: 600 }}>Quiz</span>",
  "                <button className='btn btn-ghost' style={{ fontSize: 11, padding: '3px 10px', color: '#F59E0B', border: '1px solid #F59E0B55' }}",
  "                  onClick={async () => {",
  "                    const pid = window.prompt(de ? 'Teilnehmer-ID eingeben:' : 'Enter participant ID to reset:');",
  "                    if (!pid) return;",
  "                    try {",
  "                      await fetch('/api/v1/quiz/' + q.id + '/attempts/' + pid.trim(), { method: 'DELETE', headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });",
  "                      alert(de ? 'Quiz zurückgesetzt!' : 'Quiz reset for participant!');",
  "                    } catch { alert('Error resetting quiz'); }",
  "                  }}>",
  "                  {de ? 'Zurücksetzen' : 'Reset'}",
  "                </button>",
  "              </div>",
  "            </div>",
  "          ))}",
  "        </div>",
  "      )}"
];

if (insertAt > -1) {
  lines.splice(insertAt, 0, ...quizSection);
  console.log('Quiz list inserted');
}

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', lines.join('\n'), 'utf8');
console.log('DONE');

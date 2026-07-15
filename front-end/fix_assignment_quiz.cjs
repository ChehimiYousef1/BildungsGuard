const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// 1. Add import for QuizModal at top
c = c.replace(
  "import { api } from '../../../lib/api';",
  "import { api } from '../../../lib/api';\nimport QuizModal from './QuizModal';"
);

// 2. Add quizzes state and showQuizModal state after existing state declarations
c = c.replace(
  "  const [grades,      setGrades]      = useState<Record<string, any[]>>({});",
  "  const [grades,      setGrades]      = useState<Record<string, any[]>>({});\n  const [quizzes,     setQuizzes]     = useState<any[]>([]);\n  const [showQuizModal, setShowQuizModal] = useState(false);"
);

// 3. Load quizzes in useEffect
c = c.replace(
  "      } catch { setParts([]); }",
  "      } catch { setParts([]); }\n      api('/quiz').then((q: any) => setQuizzes(Array.isArray(q) ? q : [])).catch(() => {});"
);

// 4. Add New Quiz button near existing buttons
c = c.replace(
  "<button className=\"btn btn-primary\"",
  "<button className='btn btn-ghost' onClick={() => setShowQuizModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Plus size={13} /> {de ? 'Neues Quiz' : 'New Quiz'}</button>\n              <button className=\"btn btn-primary\""
);

// 5. Add quizzes list section after assignments list
c = c.replace(
  "      {/* End of assignments */}",
  "      {/* Quiz list */}\n      {quizzes.length > 0 && (\n        <div className='card' style={{ marginTop: 16, padding: '18px 16px' }}>\n          <div className='card-title' style={{ marginBottom: 12 }}>Quizzes ({quizzes.length})</div>\n          {quizzes.map((q: any) => (\n            <div key={q.id} style={{ padding: '10px 14px', borderRadius: 9, background: '#F8FAFF', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>\n              <div>\n                <div style={{ fontWeight: 600, fontSize: 13 }}>{q.title}</div>\n                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{q.questions?.length ?? 0} {de ? 'Fragen' : 'questions'} · {q._count?.attempts ?? 0} {de ? 'Versuche' : 'attempts'}</div>\n              </div>\n              <div style={{ fontSize: 11, color: '#6D5DF6', fontWeight: 600 }}>Quiz</div>\n            </div>\n          ))}\n        </div>\n      )}\n      {/* End of assignments */}"
);

// 6. Add modal rendering before closing return
c = c.replace(
  "  );\n}",
  "      {showQuizModal && (\n        <QuizModal\n          onClose={() => setShowQuizModal(false)}\n          onCreated={(q) => { setQuizzes((qs: any[]) => [q, ...qs]); setShowQuizModal(false); }}\n        />\n      )}\n  );\n}"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// 1. Add states for view/edit
c = c.replace(
  "  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);",
  "  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);\n  const [viewQuiz,     setViewQuiz]     = useState<any | null>(null);\n  const [editQuiz,     setEditQuiz]     = useState<any | null>(null);\n  const [editTitle,    setEditTitle]    = useState('');"
);

// 2. Add action buttons to quiz row (after the Reset dropdown)
c = c.replace(
  "                    <span style={{ fontSize: 12, color: '#94A3B8' }}>{isExp ? '-' : '+'}</span>",
  "                    <button onClick={(e) => { e.stopPropagation(); setViewQuiz(q); }} title='View' style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6D5DF6', fontSize: 12, padding: '2px 6px' }}>??</button>\n                    <button onClick={(e) => { e.stopPropagation(); setEditQuiz(q); setEditTitle(q.title); }} title='Edit' style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F59E0B', fontSize: 12, padding: '2px 6px' }}>??</button>\n                    <button onClick={async (e) => { e.stopPropagation(); if (!window.confirm(de ? 'Quiz löschen?' : 'Delete this quiz?')) return; await api('/quiz/' + q.id, { method: 'DELETE' }); setQuizzes((qs: any[]) => qs.filter(x => x.id !== q.id)); }} title='Delete' style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F4475F', fontSize: 12, padding: '2px 6px' }}>??</button>\n                    <span style={{ fontSize: 12, color: '#94A3B8' }}>{isExp ? '-' : '+'}</span>"
);

// 3. Add View Modal before showQuizModal
const viewModal = `      {/* ===== VIEW QUIZ MODAL ===== */}
      {viewQuiz && (
        <div onClick={() => setViewQuiz(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,40,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className='card' style={{ width: '100%', maxWidth: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{viewQuiz.title}</div>
              <button onClick={() => setViewQuiz(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94A3B8' }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: '#64748B' }}>{viewQuiz.questions?.length ?? 0} {de ? 'Fragen' : 'questions'} · Pass mark: {viewQuiz.passMark ?? 50}%</div>
              {(viewQuiz.questions || []).map((q: any, i: number) => (
                <div key={q.id} style={{ border: '1px solid #E2E8F0', borderRadius: 9, padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>{i+1}. {q.question}</div>
                  {['A','B','C','D'].filter(o => q['option'+o]).map(o => (
                    <div key={o} style={{ fontSize: 12.5, padding: '5px 10px', borderRadius: 6, marginBottom: 4, background: q.correctAnswer === o ? '#0FB6A015' : '#F8FAFC', color: q.correctAnswer === o ? '#0FB6A0' : '#475569', fontWeight: q.correctAnswer === o ? 700 : 400, border: q.correctAnswer === o ? '1px solid #0FB6A030' : '1px solid transparent' }}>
                      {o}. {q['option'+o]} {q.correctAnswer === o ? '?' : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button className='btn btn-ghost' onClick={() => setViewQuiz(null)}>{de ? 'Schließen' : 'Close'}</button>
            </div>
          </div>
        </div>
      )}`;

// 4. Add Edit Modal
const editModal = `      {/* ===== EDIT QUIZ MODAL ===== */}
      {editQuiz && (
        <div onClick={() => setEditQuiz(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,40,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className='card' style={{ width: '100%', maxWidth: 420, padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{de ? 'Quiz bearbeiten' : 'Edit Quiz'}</div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {de ? 'Titel' : 'Title'}
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' }} autoFocus />
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className='btn btn-ghost' onClick={() => setEditQuiz(null)}>{de ? 'Abbrechen' : 'Cancel'}</button>
              <button className='btn btn-primary' onClick={async () => {
                if (!editTitle.trim()) return;
                await api('/quiz/' + editQuiz.id, { method: 'PATCH', body: JSON.stringify({ title: editTitle }) });
                setQuizzes((qs: any[]) => qs.map(q => q.id === editQuiz.id ? { ...q, title: editTitle } : q));
                setEditQuiz(null);
              }}>{de ? 'Speichern' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}`;

c = c.replace(
  "      {showQuizModal && (",
  viewModal + "\n" + editModal + "\n      {showQuizModal && ("
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

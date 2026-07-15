const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');
const lines = c.split('\n');

// 1. Remove New Quiz button
const quizBtnIdx = lines.findIndex(l => l.includes("setShowQuizModal(true)") && l.includes("New Quiz"));
if (quizBtnIdx > -1) { lines.splice(quizBtnIdx, 1); console.log('Removed New Quiz btn'); }

// 2. Add showAssignMenu state
const quizModalStateIdx = lines.findIndex(l => l.includes('[showQuizModal, setShowQuizModal]'));
if (quizModalStateIdx > -1) {
  lines.splice(quizModalStateIdx + 1, 0, "  const [showAssignMenu, setShowAssignMenu] = useState(false);");
  console.log('Added showAssignMenu state');
}

// 3. Replace New Assignment button
let btnStart = -1, btnEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('btn-primary') && lines[i].includes('setAdding')) { btnStart = i; break; }
}
if (btnStart === -1) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('New Assignment') && lines[i].includes('btn-primary')) { btnStart = i - 2; break; }
  }
}
if (btnStart > -1) {
  btnEnd = btnStart;
  for (let i = btnStart + 1; i < btnStart + 6; i++) {
    if (lines[i] && lines[i].includes('</button>')) { btnEnd = i; break; }
  }
  console.log('Button:', btnStart + 1, 'to', btnEnd + 1);
  
  const newBtn = [
    "          <div style={{ position: 'relative' }}>",
    "            <button className='btn btn-primary' style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 5 }}",
    "              onClick={() => setShowAssignMenu(s => !s)}>",
    "              <Plus size={14} /> {de ? 'Neue Aufgabe' : 'New Assignment'} \u25be",
    "            </button>",
    "            {showAssignMenu && (",
    "              <div onClick={() => setShowAssignMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />",
    "            )}",
    "            {showAssignMenu && (",
    "              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: 'white', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 50, minWidth: 230, overflow: 'hidden' }}>",
    "                <div style={{ padding: '8px 14px 6px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>",
    "                  {de ? 'Aufgabentyp wählen' : 'Choose Assignment Type'}",
    "                </div>",
    "                <button onClick={() => { setShowAssignMenu(false); setAdding(true); }}",
    "                  style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderTop: '1px solid #F1F5F9' }}>",
    "                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{de ? 'Aufgabe (Freitext)' : 'Assignment (Text)'}</span>",
    "                  <span style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{de ? 'Manuelle Benotung' : 'Manual grading'}</span>",
    "                </button>",
    "                <button onClick={() => { setShowAssignMenu(false); setShowQuizModal(true); }}",
    "                  style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderTop: '1px solid #F1F5F9' }}>",
    "                  <span style={{ fontWeight: 600, fontSize: 13, color: '#6D5DF6' }}>MCQ Quiz</span>",
    "                  <span style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{de ? 'Eine richtige Antwort' : 'Single correct answer per question'}</span>",
    "                </button>",
    "              </div>",
    "            )}",
    "          </div>"
  ];
  
  lines.splice(btnStart, btnEnd - btnStart + 1, ...newBtn);
  console.log('Replaced with dropdown');
}

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', lines.join('\n'), 'utf8');
console.log('DONE');

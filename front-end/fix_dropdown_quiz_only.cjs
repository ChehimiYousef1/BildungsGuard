const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Remove "Assignment (Text)" button from dropdown
c = c.replace(
  "                <button onClick={() => { setShowAssignMenu(false); setAdding(true); }}\n                  style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderTop: '1px solid #F1F5F9' }}>\n                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{de ? 'Aufgabe (Freitext)' : 'Assignment (Text)'}</span>\n                  <span style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{de ? 'Manuelle Benotung' : 'Manual grading'}</span>\n                </button>",
  ""
);

// Rename "MCQ Quiz" to "Quiz"
c = c.replace(
  "<span style={{ fontWeight: 600, fontSize: 13, color: '#6D5DF6' }}>MCQ Quiz</span>",
  "<span style={{ fontWeight: 600, fontSize: 13, color: '#6D5DF6' }}>Quiz</span>"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

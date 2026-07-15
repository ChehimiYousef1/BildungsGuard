const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

c = c.replace(
  "              <div style={{ fontSize: 11, color: '#6D5DF6', fontWeight: 600 }}>Quiz</div>",
  "              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>\n                <span style={{ fontSize: 11, color: '#6D5DF6', fontWeight: 600 }}>Quiz</span>\n                <button className='btn btn-ghost' style={{ fontSize: 11, padding: '3px 10px', color: '#F59E0B', border: '1px solid #F59E0B55' }}\n                  onClick={async () => {\n                    const pid = window.prompt(de ? 'Teilnehmer-ID eingeben:' : 'Enter participant ID to reset:');\n                    if (!pid) return;\n                    try {\n                      await fetch('/api/v1/quiz/' + q.id + '/attempts/' + pid.trim(), { method: 'DELETE', headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });\n                      alert(de ? 'Quiz zurückgesetzt!' : 'Quiz reset for participant!');\n                    } catch { alert('Error resetting quiz'); }\n                  }}>\n                  {de ? 'Zurücksetzen' : 'Reset'}\n                </button>\n              </div>"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

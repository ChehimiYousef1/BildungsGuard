const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Replace the prompt-based reset with a select dropdown
c = c.replace(
  "                <button className='btn btn-ghost' style={{ fontSize: 11, padding: '3px 10px', color: '#F59E0B', border: '1px solid #F59E0B55' }}\n                  onClick={async () => {\n                    const pid = window.prompt(de ? 'Teilnehmer-ID eingeben:' : 'Enter participant ID to reset:');\n                    if (!pid) return;\n                    try {\n                      await fetch('/api/v1/quiz/' + q.id + '/attempts/' + pid.trim(), { method: 'DELETE', headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });\n                      alert(de ? 'Quiz zurückgesetzt!' : 'Quiz reset for participant!');\n                    } catch { alert('Error resetting quiz'); }\n                  }}>\n                  {de ? 'Zurücksetzen' : 'Reset'}\n                </button>",
  "                <select defaultValue='' onChange={async (e) => {\n                    const pid = e.target.value;\n                    if (!pid) return;\n                    e.target.value = '';\n                    try {\n                      await fetch('/api/v1/quiz/' + q.id + '/attempts/' + pid, { method: 'DELETE', headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });\n                      alert(de ? 'Quiz zurückgesetzt!' : 'Quiz reset!');\n                    } catch { alert('Error'); }\n                  }} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 7, border: '1px solid #F59E0B55', color: '#F59E0B', cursor: 'pointer', outline: 'none', background: '#FFFBEB' }}>\n                  <option value=''>{de ? 'Zurücksetzen...' : 'Reset for...'}</option>\n                  {parts.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}\n                </select>"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

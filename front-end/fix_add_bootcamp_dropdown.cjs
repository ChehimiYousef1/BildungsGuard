const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');
const lines = c.split('\n');

// Insert dropdown before line 207 (index 206) - before the buttons div
const dropdown = [
  "        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>",
  "          <select value={selMeasure} onChange={e => setSelMeasure(e.target.value)}",
  "            style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', minWidth: 200 }}>",
  "            <option value=''>{de ? 'Alle Bootcamps' : 'All Bootcamps'}</option>",
  "            {measures.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}",
  "          </select>",
  "        </div>"
];

lines.splice(206, 0, ...dropdown);
fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', lines.join('\n'), 'utf8');
console.log('DONE');

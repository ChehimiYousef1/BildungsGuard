const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

c = c.replace(
  "style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, border: 'none', background: '#6D5DF6', color: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}>",
  "className='btn btn-ghost' style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', fontSize: 12.5 }}>"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

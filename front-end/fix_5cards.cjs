const fs = require('fs');
let c = fs.readFileSync('src/features/measures/List.tsx', 'utf8');

const oldCards = c.match(/<div style=\{\{ display: 'flex', gap: 8, marginTop: 14[\s\S]*?<\/div>\s*<\/div>/)?.[0];
if (!oldCards) { console.log('Cards not found'); process.exit(1); }

const newCards = `<div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          <div style={{ background: '#F59E0B10', border: '1px solid #F59E0B40', borderRadius: 8, padding: '8px 14px', minWidth: 75 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: 0.5 }}>{de ? 'Geplant' : 'Planned'}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#F59E0B' }}>{rows.filter((r) => r.status === 'planned').length}</div>
          </div>
          <div style={{ background: '#6D5DF610', border: '1px solid #6D5DF640', borderRadius: 8, padding: '8px 14px', minWidth: 75 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6D5DF6', textTransform: 'uppercase', letterSpacing: 0.5 }}>{de ? 'Laufend' : 'Running'}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#6D5DF6' }}>{rows.filter((r) => r.status === 'running' || r.status === 'active').length}</div>
          </div>
          <div style={{ background: '#3B82F610', border: '1px solid #3B82F640', borderRadius: 8, padding: '8px 14px', minWidth: 75 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: 0.5 }}>{de ? 'Abschluss' : 'Finishing'}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#3B82F6' }}>{rows.filter((r) => r.status === 'finishing').length}</div>
          </div>
          <div style={{ background: '#0FB6A010', border: '1px solid #0FB6A040', borderRadius: 8, padding: '8px 14px', minWidth: 75 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#0FB6A0', textTransform: 'uppercase', letterSpacing: 0.5 }}>{de ? 'Fertig' : 'Done'}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0FB6A0' }}>{rows.filter((r) => r.status === 'done' || r.status === 'completed').length}</div>
          </div>
          <div style={{ background: '#33415510', border: '1px solid #33415540', borderRadius: 8, padding: '8px 14px', minWidth: 75 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5 }}>{de ? 'Gesamt' : 'Total'}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#334155' }}>{rows.length}</div>
          </div>
        </div>`;

c = c.replace(oldCards, newCards);
fs.writeFileSync('src/features/measures/List.tsx', c, 'utf8');
console.log('DONE');

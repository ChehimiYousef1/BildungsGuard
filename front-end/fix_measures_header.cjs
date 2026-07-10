const fs = require('fs');
let c = fs.readFileSync('src/features/measures/List.tsx', 'utf8');

// 1. Remove count from title
c = c.replace(
  "{de ? 'Ma\u00dfnahmen' : 'Bootcamps'} \u00b7 {rows.length}",
  "{de ? 'Ma\u00dfnahmen' : 'Bootcamps'}"
);

// 2. Add metric cards after subtitle
const subtitle = "AZAV approval, curriculum, enrollment'}";
const idx = c.indexOf(subtitle);
if (idx > -1) {
  const afterIdx = c.indexOf('</div>', idx) + 6;
  const cards = `
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginTop: 14 }}>
          <div style={{ background: '#6D5DF610', border: '1px solid #6D5DF630', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6D5DF6', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{de ? 'Aktiv' : 'Active'}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#6D5DF6' }}>{rows.filter((r) => r.status === 'active' || r.status === 'running').length}</div>
          </div>
          <div style={{ background: '#0FB6A010', border: '1px solid #0FB6A030', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#0FB6A0', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{de ? 'Abgeschlossen' : 'Finished'}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0FB6A0' }}>{rows.filter((r) => r.status === 'completed' || r.status === 'finished').length}</div>
          </div>
          <div style={{ background: '#F59E0B10', border: '1px solid #F59E0B30', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{de ? 'Geplant' : 'Planned'}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#F59E0B' }}>{rows.filter((r) => r.status === 'planned' || !r.status).length}</div>
          </div>
          <div style={{ background: '#33415510', border: '1px solid #33415530', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{de ? 'Gesamt' : 'Total'}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#334155' }}>{rows.length}</div>
          </div>
        </div>`;
  c = c.slice(0, afterIdx) + cards + c.slice(afterIdx);
  console.log('Cards added OK');
} else {
  console.log('Subtitle not found');
}

fs.writeFileSync('src/features/measures/List.tsx', c, 'utf8');
console.log('DONE');

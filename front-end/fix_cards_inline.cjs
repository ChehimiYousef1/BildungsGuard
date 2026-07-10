const fs = require('fs');
let c = fs.readFileSync('src/features/measures/List.tsx', 'utf8');

// Find and replace the entire cards block
const start = c.indexOf("<div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>");
const end = c.indexOf('</div>', c.indexOf('</div>', c.indexOf('</div>', c.indexOf('</div>', c.indexOf('</div>', start) + 1) + 1) + 1) + 1) + 6;

const newCards = `<div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {[
            { label: de ? 'Geplant' : 'Planned',   count: rows.filter((r) => r.status === 'planned').length,                             col: '#F59E0B' },
            { label: de ? 'Laufend' : 'Running',   count: rows.filter((r) => r.status === 'running' || r.status === 'active').length,    col: '#6D5DF6' },
            { label: de ? 'Abschluss' : 'Finishing', count: rows.filter((r) => r.status === 'finishing').length,                          col: '#3B82F6' },
            { label: de ? 'Fertig' : 'Done',        count: rows.filter((r) => r.status === 'done' || r.status === 'completed').length,    col: '#0FB6A0' },
            { label: de ? 'Gesamt' : 'Total',       count: rows.length,                                                                   col: '#334155' },
          ].map((item, i) => (
            <div key={i} style={{ background: item.col + '12', border: '1px solid ' + item.col + '30', borderRadius: 8, padding: '6px 12px', textAlign: 'center', minWidth: 70 }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: item.col, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: item.col }}>{item.count}</div>
            </div>
          ))}
        </div>`;

c = c.slice(0, start) + newCards + c.slice(end);
fs.writeFileSync('src/features/measures/List.tsx', c, 'utf8');
console.log('DONE');

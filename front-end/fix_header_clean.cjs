const fs = require('fs');
let c = fs.readFileSync('src/features/measures/List.tsx', 'utf8');

// Find the entire header card block
const headerStart = c.indexOf("      {/* ===== HEADER =====");
const headerEnd = c.indexOf("{loading &&", headerStart);

const newHeader = `      {/* ===== HEADER ===== */}
      <div className="card" style={{ marginBottom: 15, padding: '14px 18px' }}>
        <div className="card-head">
          <div>
            <div className="card-title" style={{ fontSize: 16 }}>
              {de ? 'Ma\u00dfnahmen' : 'Bootcamps'}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
              {de ? 'AZAV-Zulassung, Curriculum, Belegung' : 'AZAV approval, curriculum, enrollment'}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              {[
                { label: de ? 'Geplant' : 'Planned',    count: rows.filter((r) => r.status === 'planned').length,                           col: '#F59E0B' },
                { label: de ? 'Laufend' : 'Running',    count: rows.filter((r) => r.status === 'running' || r.status === 'active').length,  col: '#6D5DF6' },
                { label: de ? 'Abschluss' : 'Finishing',count: rows.filter((r) => r.status === 'finishing').length,                          col: '#3B82F6' },
                { label: de ? 'Fertig' : 'Done',        count: rows.filter((r) => r.status === 'done' || r.status === 'completed').length,  col: '#0FB6A0' },
                { label: de ? 'Gesamt' : 'Total',       count: rows.length,                                                                  col: '#334155' },
              ].map((item, i) => (
                <div key={i} style={{ background: item.col + '12', border: '1px solid ' + item.col + '30', borderRadius: 7, padding: '5px 10px', textAlign: 'center', minWidth: 65 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: item.col, textTransform: 'uppercase', letterSpacing: 0.4 }}>{item.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: item.col }}>{item.count}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={openAdd}>
            <Plus size={14} /> {de ? 'Hinzuf\u00fcgen' : 'Add'}
          </button>
        </div>
      </div>

      `;

c = c.slice(0, headerStart) + newHeader + c.slice(headerEnd);
fs.writeFileSync('src/features/measures/List.tsx', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// Replace old card-head with new layout
c = c.replace(
  `          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              style={{ padding: '7px 11px', borderRadius: 9, border: \`1px solid \${C.line}\`, fontSize: 12.5, outline: 'none', cursor: 'pointer' }}
            >
              <option value="">{de ? '— Alle —' : '— All —'}</option>
              {Object.entries(OUTCOME_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{de ? val.de : val.en}</option>
              ))}
            </select>
            <button className="btn btn-ghost" style={{ padding: '7px 10px' }} onClick={load}
              title={de ? 'Aktualisieren' : 'Refresh'}>
              <RefreshCw size={14} color={C.muted} />
            </button>
          </div>`,
  `          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={exportExcel} disabled={filteredAlumni.length === 0}
              className="btn btn-ghost" style={{ padding: '7px 13px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Download size={14} /> {de ? 'Excel Export' : 'Excel Export'}
              {(filterMeasure || filterOutcome) && <span style={{ fontSize: 11, background: C.iris + '18', color: C.iris, borderRadius: 20, padding: '1px 7px' }}>{filteredAlumni.length}</span>}
            </button>
            <button className="btn btn-ghost" style={{ padding: '7px 10px' }} onClick={load}
              title={de ? 'Aktualisieren' : 'Refresh'}>
              <RefreshCw size={14} color={C.muted} />
            </button>
          </div>`
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

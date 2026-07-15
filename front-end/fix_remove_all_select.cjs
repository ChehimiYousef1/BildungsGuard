const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// Remove the "— All —" select that is next to Refresh button
c = c.replace(
  `            <select
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
            </button>`,
  `<button className="btn btn-ghost" style={{ padding: '7px 10px' }} onClick={load}
              title={de ? 'Aktualisieren' : 'Refresh'}>
              <RefreshCw size={14} color={C.muted} />
            </button>`
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

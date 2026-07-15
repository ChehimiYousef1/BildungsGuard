const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// Remove refresh from card-head
c = c.replace(
  `<button className="btn btn-ghost" style={{ padding: '7px 10px' }} onClick={load}
              title={de ? 'Aktualisieren' : 'Refresh'}>
              <RefreshCw size={14} color={C.muted} />
            </button>`,
  ``
);

// Add refresh next to Export Excel in filter bar
c = c.replace(
  "          {filterMeasure && (",
  `          <button className="btn btn-ghost" style={{ padding: '7px 10px', display: 'flex', alignItems: 'center' }} onClick={load}
            title={de ? 'Aktualisieren' : 'Refresh'}>
            <RefreshCw size={14} color={C.muted} />
          </button>

          {filterMeasure && (`
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

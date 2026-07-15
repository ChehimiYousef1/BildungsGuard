const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// 1. Add filterOutcome state
c = c.replace(
  "  const [filterMeasure, setFilterMeasure] = useState('');",
  "  const [filterMeasure, setFilterMeasure] = useState('');\n  const [filterOutcome,  setFilterOutcome]  = useState('');"
);

// 2. Fix filteredAlumni to include outcome filter
c = c.replace(
  "const filteredAlumni = filterMeasure ? alumni.filter((a: any) => a.measureId === filterMeasure) : alumni;",
  "const filteredAlumni = alumni.filter((a: any) => {\n    if (filterMeasure && a.measureId !== filterMeasure) return false;\n    if (filterOutcome && a.outcome !== filterOutcome) return false;\n    return true;\n  });"
);

// 3. Add outcome select after bootcamp select
c = c.replace(
  "          {filterMeasure && (",
  `          <select value={filterOutcome} onChange={(e) => setFilterOutcome(e.target.value)}
            style={{ padding: '7px 11px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12.5, outline: 'none', cursor: 'pointer', minWidth: 150 }}>
            <option value="">— All Status —</option>
            <option value="employed">Employed</option>
            <option value="job_seeking">Job-seeking</option>
            <option value="education">In education</option>
            <option value="training">In training</option>
            <option value="other">Other</option>
            <option value="unknown">Unknown</option>
          </select>

          {filterMeasure && (`
);

// 4. Fix clear button to also clear outcome
c = c.replace(
  "onClick={() => setFilterMeasure('')}",
  "onClick={() => { setFilterMeasure(''); setFilterOutcome(''); }}"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

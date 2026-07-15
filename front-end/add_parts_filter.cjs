const fs = require('fs');
let c = fs.readFileSync('src/features/participants/List.tsx', 'utf8');

// 1. Add states
const lastState = c.lastIndexOf("= useState(");
const lineEnd = c.indexOf(';', lastState) + 1;
c = c.slice(0, lineEnd) + "\n  const [filterMeasure, setFilterMeasure] = useState('');\n  const [Bootcamps,      setBootcamps]      = useState<any[]>([]);" + c.slice(lineEnd);

// 2. Load bootcamps in useEffect
c = c.replace(
  "  useEffect(() => { load(); }, []);",
  "  useEffect(() => {\n    load();\n    api('/measures').then((d: any) => setBootcamps(Array.isArray(d) ? d : [])).catch(() => {});\n  }, []);"
);

// 3. Add filteredRows before return
const returnIdx = c.lastIndexOf('\n  return (');
c = c.slice(0, returnIdx) +
  "\n  const filteredRows = filterMeasure ? rows.filter((p) => (p.measureId ?? p.measure?.id) === filterMeasure) : rows;\n" +
  c.slice(returnIdx);

// 4. Add filter UI - find the first loading div and insert before it
c = c.replace(
  "      {loading && <div style={{ padding: 20",
  `      {/* BOOTCAMP FILTER */}
      <div style={{ display: 'flex', gap: 8, padding: '0 13px 12px', alignItems: 'center' }}>
        <select value={filterMeasure} onChange={(e) => setFilterMeasure(e.target.value)}
          style={{ padding: '7px 11px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12.5, outline: 'none', cursor: 'pointer', minWidth: 190 }}>
          <option value="">— All Bootcamps —</option>
          {Bootcamps.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        {filterMeasure && (
          <button onClick={() => setFilterMeasure('')}
            style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'none', cursor: 'pointer', fontSize: 12 }}>
            ? Clear
          </button>
        )}
      </div>

      {loading && <div style={{ padding: 20`
);

// 5. Replace rows.map with filteredRows.map in table
c = c.split('{rows.map(').join('{filteredRows.map(');

// 6. Fix exportExcel to use filteredRows
c = c.replace(
  "  const exportExcel = () => {\n    const data = rows.map(",
  "  const exportExcel = () => {\n    const data = filteredRows.map("
);

fs.writeFileSync('src/features/participants/List.tsx', c, 'utf8');
console.log('DONE');

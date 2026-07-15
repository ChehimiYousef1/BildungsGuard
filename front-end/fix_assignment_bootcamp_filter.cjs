const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// 1. Add measures state
c = c.replace(
  "  const [parts,       setParts]       = useState<any[]>([]);",
  "  const [parts,       setParts]       = useState<any[]>([]);\n  const [measures,    setMeasures]    = useState<any[]>([]);\n  const [selMeasure,  setSelMeasure]  = useState('');"
);

// 2. Load measures in useEffect
c = c.replace(
  "        const data = await api<any[]>('/participants');",
  "        const [data, meas] = await Promise.all([\n          api<any[]>('/participants').catch(() => []),\n          api<any[]>('/measures').catch(() => []),\n        ]);\n        setMeasures(Array.isArray(meas) ? meas : []);const _data = data;"
);
c = c.replace(
  "        const list = Array.isArray(data) ? data : [];",
  "        const list = Array.isArray(_data) ? _data : [];"
);

// 3. Add filtered parts computed from selMeasure
c = c.replace(
  "  const getScore = (pid: string, a: Assignment) => {",
  "  const filteredParts = selMeasure ? parts.filter(p => p.measureId === selMeasure) : parts;\n\n  const getScore = (pid: string, a: Assignment) => {"
);

// 4. Replace parts.map with filteredParts.map in JSX
c = c.replace(
  "                  {parts.map((p) => {",
  "                  {filteredParts.map((p) => {"
);

// 5. Add bootcamp filter dropdown in the card header
c = c.replace(
  "              <ExcelBtn onClick={exportExcel} />",
  "<select value={selMeasure} onChange={e => setSelMeasure(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12.5, outline: 'none' }}><option value=''>{de ? 'Alle Bootcamps' : 'All Bootcamps'}</option>{measures.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>\n              <ExcelBtn onClick={exportExcel} />"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

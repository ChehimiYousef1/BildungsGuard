const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// 1. Add XLSX import
if (!c.includes("from 'xlsx'")) {
  c = "import * as XLSX from 'xlsx';\n" + c;
}

// 2. Add Download to lucide imports
if (!c.includes('Download')) {
  c = c.replace("} from 'lucide-react';", "  Download,\n} from 'lucide-react';");
}

// 3. Add filterMeasure state - find last useState line
const lastState = c.lastIndexOf("= useState(");
const lineEnd = c.indexOf(';', lastState) + 1;
c = c.slice(0, lineEnd) + "\n  const [filterMeasure, setFilterMeasure] = useState('');" + c.slice(lineEnd);

// 4. Add computed variables + export function before return
const returnIdx = c.lastIndexOf('\n  return (');
c = c.slice(0, returnIdx) + `

  const bootcampNames = [...new Set(alumni.map((a: any) => a.measure).filter(Boolean))];
  const filteredAlumni = filterMeasure ? alumni.filter((a: any) => a.measure === filterMeasure) : alumni;

  const exportExcel = () => {
    const rows = filteredAlumni.map((a: any) => ({
      Name: a.name ?? '', Bootcamp: a.measure ?? '',
      Outcome: a.outcome ?? '', Employer: a.employer ?? '',
      Email: a.contact ?? '', Phone: a.phone ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alumni');
    XLSX.writeFile(wb, 'alumni_' + (filterMeasure || 'all') + '.xlsx');
  };
` + c.slice(returnIdx);

// 5. Add filter bar - find first <table> and insert before it
const tableIdx = c.indexOf('<table>');
if (tableIdx > -1) {
  const filterBar = `
        {/* ===== BOOTCAMP FILTER + EXPORT ===== */}
        <div style={{ display: 'flex', gap: 8, padding: '0 0 12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={filterMeasure} onChange={(e) => setFilterMeasure(e.target.value)}
            style={{ padding: '7px 11px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12.5, outline: 'none', cursor: 'pointer', minWidth: 190 }}>
            <option value="">— All Bootcamps —</option>
            {bootcampNames.map((m: any) => <option key={m} value={m}>{m}</option>)}
          </select>
          {filterMeasure && (
            <button onClick={() => setFilterMeasure('')}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'none', cursor: 'pointer', fontSize: 12 }}>
              ? Clear
            </button>
          )}
          <button onClick={exportExcel} disabled={filteredAlumni.length === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 8, border: 'none', background: '#6D5DF6', color: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}>
            <Download size={14} /> Export Excel {filterMeasure ? '(' + filteredAlumni.length + ')' : '(' + alumni.length + ')'}
          </button>
        </div>

        `;
  c = c.slice(0, tableIdx) + filterBar + c.slice(tableIdx);
}

// 6. Replace alumni.map with filteredAlumni.map
c = c.split('{alumni.map(').join('{filteredAlumni.map(');
c = c.split('alumni.map(').join('filteredAlumni.map(');

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

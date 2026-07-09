const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Check if function exists
if (c.includes('const exportExcel')) {
  console.log('Function already exists');
} else {
  // Add function before default export or before return
  const fn = `
  const exportExcel = () => {
    if (typeof XLSX === 'undefined') { alert('XLSX not loaded'); return; }
    const rows = [];
    (parts || []).forEach((p) => {
      (assignments || []).forEach((a) => {
        const tests = (grades || {})[p.id] || [];
        const g = tests.find((t) => t.assignmentId === a.id || t.title === a.title);
        const score = g ? (g.score ?? g.value ?? null) : null;
        const pct = score !== null && a.maxScore > 0 ? Math.round((score / a.maxScore) * 100) : null;
        rows.push({
          Teilnehmer: p.name || '',
          Aufgabe: a.title,
          MaxPunkte: a.maxScore,
          Punkte: score !== null ? score : '',
          Prozent: pct !== null ? pct + '%' : '',
          Bestanden: pct !== null ? (pct >= 50 ? 'Ja' : 'Nein') : '',
        });
      });
    });
    if (!rows.length) { alert('Keine Daten'); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Aufgaben');
    XLSX.writeFile(wb, 'assignments_' + new Date().toISOString().slice(0,10) + '.xlsx');
  };
`;
  // Insert before last return statement
  const idx = c.lastIndexOf('return (');
  if (idx > -1) {
    c = c.slice(0, idx) + fn + '\n  ' + c.slice(idx);
    console.log('Function added at index', idx);
  } else {
    console.log('ERROR: return not found');
  }
}

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

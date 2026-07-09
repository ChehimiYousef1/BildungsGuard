const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Fix iimport if exists
c = c.replace(/^iimport/, 'import');

// 1. Add XLSX import after first import line
if (!c.includes("xlsx")) {
  c = c.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport * as XLSX from 'xlsx';"
  );
}

// 2. Add Download to lucide imports
if (!c.includes('Download')) {
  c = c.replace(
    /import \{([^}]+)\} from 'lucide-react';/,
    (m, g) => `import {${g.trimEnd()}, Download } from 'lucide-react';`
  );
}

// 3. Add export function before last return
const exportFn = `
  const exportExcel = () => {
    const rows = [];
    parts.forEach((p) => {
      assignments.forEach((a) => {
        const tests = grades[p.id] ?? [];
        const g = tests.find((t) => t.assignmentId === a.id || t.title === a.title);
        const score = g ? (g.score ?? g.value ?? null) : null;
        const pct = score !== null && a.maxScore > 0 ? Math.round((score / a.maxScore) * 100) : null;
        rows.push({
          Teilnehmer: p.name ?? '',
          Kontakt: p.contact ?? p.email ?? '',
          Aufgabe: a.title,
          'Max. Punkte': a.maxScore,
          Punkte: score ?? '—',
          Prozent: pct !== null ? pct + '%' : '—',
          Bestanden: pct !== null ? (pct >= 50 ? 'Ja' : 'Nein') : '—',
        });
      });
    });
    if (rows.length === 0) { alert('Keine Daten.'); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Aufgaben');
    ws['!cols'] = [{ wch: 22 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
    XLSX.writeFile(wb, 'assignments_' + new Date().toISOString().slice(0,10) + '.xlsx');
  };
`;

const lastReturn = c.lastIndexOf('\n  return (');
if (lastReturn > -1) {
  c = c.slice(0, lastReturn) + '\n' + exportFn + '\n  return (' + c.slice(lastReturn + '\n  return ('.length);
}

// 4. Add export button — inject after first <Award or after card-title div
const btnCode = `
              <button
                className="btn btn-ghost"
                style={{ padding: '7px 13px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={exportExcel}
                disabled={parts.length === 0}
              >
                <Download size={14} /> {de ? 'Excel exportieren' : 'Export Excel'}
              </button>`;

// Find the first card-head closing and insert button before it
const headEnd = c.indexOf('</div>', c.indexOf('card-head'));
if (headEnd > -1) {
  c = c.slice(0, headEnd) + btnCode + '\n          ' + c.slice(headEnd);
}

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE - size:', c.length);

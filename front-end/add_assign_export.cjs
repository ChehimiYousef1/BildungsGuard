const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Add XLSX import
c = c.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect } from 'react';\nimport * as XLSX from 'xlsx';"
);

// Add Download icon
c = c.replace(
  "import { Plus, X, Trash2, Award, CheckCircle2, XCircle, Pencil, Check } from 'lucide-react';",
  "import { Plus, X, Trash2, Award, CheckCircle2, XCircle, Pencil, Check, Download } from 'lucide-react';"
);

// Add exportExcel function before return
const exportFn = `
  const exportExcel = () => {
    const data = parts.flatMap((p) => {
      const pGrades = grades[p.id] ?? [];
      return assignments.map((a) => {
        const g = pGrades.find((x) => x.assignmentId === a.id || x.title === a.title);
        const score = g?.score ?? g?.value ?? null;
        const pct   = score !== null && a.maxScore > 0 ? Math.round((score / a.maxScore) * 100) : null;
        return {
          [de ? 'Teilnehmer' : 'Participant']: p.name ?? '',
          [de ? 'Kontakt'    : 'Contact']:     p.contact ?? p.email ?? '',
          [de ? 'Aufgabe'    : 'Assignment']:  a.title,
          [de ? 'Punkte'     : 'Score']:       score ?? '—',
          [de ? 'Max'        : 'Max']:         a.maxScore,
          [de ? 'Prozent'    : 'Percent']:     pct !== null ? pct + '%' : '—',
          [de ? 'Bestanden'  : 'Passed']:      pct !== null ? (pct >= 50 ? (de ? 'Ja' : 'Yes') : (de ? 'Nein' : 'No')) : '—',
        };
      });
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, de ? 'Aufgaben' : 'Assignments');
    ws['!cols'] = [{ wch: 22 }, { wch: 25 }, { wch: 20 }, { wch: 8 }, { wch: 6 }, { wch: 10 }, { wch: 10 }];
    XLSX.writeFile(wb, 'assignments_' + new Date().toISOString().slice(0,10) + '.xlsx');
  };
`;

const lastReturn = c.lastIndexOf('  return (');
c = c.slice(0, lastReturn) + exportFn + '\n  return (' + c.slice(lastReturn + '  return ('.length);

// Add button before closing of card-head or near title
c = c.replace(
  '<Award size={18} color={C.iris} />',
  `<div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ padding: '7px 13px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }} onClick={exportExcel} disabled={parts.length === 0}>
                <Download size={14} /> {de ? 'Excel exportieren' : 'Export Excel'}
              </button>
              <Award size={18} color={C.iris} />
            </div>`
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');

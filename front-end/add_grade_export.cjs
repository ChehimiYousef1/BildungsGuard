const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Grading.tsx', 'utf8');

// 1. Add XLSX import
if (!c.includes('xlsx')) {
  c = c.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport * as XLSX from 'xlsx';"
  );
}

// 2. Add Download icon
if (!c.includes('Download')) {
  c = c.replace(
    "  Award, CheckCircle2, BookOpen, Users,\n  ChevronDown, X, Check",
    "  Award, CheckCircle2, BookOpen, Users,\n  ChevronDown, X, Check, Download"
  );
}

// 3. Add export function before last return
const exportFn = `
  const exportExcel = () => {
    const filtered = participants.filter((p) =>
      !selMeasure || p.measureId === selMeasure || p.measure?.id === selMeasure
    );
    const rows = filtered.map((p) => {
      const pSurveys = surveys.filter((s) => s.participantId === p.id && s.type === 'test');
      const lastTest = pSurveys[pSurveys.length - 1];
      const score = lastTest?.score ?? lastTest?.value ?? null;
      const pct   = score !== null && lastTest?.maxScore > 0
        ? Math.round((score / lastTest.maxScore) * 100) : null;
      return {
        Teilnehmer:  p.name ?? '',
        Kontakt:     p.contact ?? p.email ?? '',
        Bootcamp:    translateText(p.measure?.name ?? p.m ?? '', lang),
        Aufgabe:     lastTest?.title ?? '',
        Punkte:      score !== null ? score : '',
        MaxPunkte:   lastTest?.maxScore ?? '',
        Prozent:     pct !== null ? pct + '%' : '',
        Bestanden:   pct !== null ? (pct >= 50 ? 'Ja' : 'Nein') : '',
      };
    });
    if (!rows.length) { alert('Keine Daten'); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bewertungen');
    ws['!cols'] = [{ wch: 22 }, { wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 10 }];
    XLSX.writeFile(wb, 'grading_' + new Date().toISOString().slice(0,10) + '.xlsx');
  };
`;

const lastReturn = c.lastIndexOf('\n  return (');
c = c.slice(0, lastReturn) + '\n' + exportFn + '\n  return (' + c.slice(lastReturn + '\n  return ('.length);

// 4. Add button - find card-head and add button inside
const cardHead = c.indexOf('card-head');
const closeDiv = c.indexOf('</div>', cardHead);
const btn = `
              <button
                className="btn btn-ghost"
                style={{ padding: '7px 13px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={exportExcel}
                disabled={participants.length === 0}
              >
                <Download size={14} /> {de ? 'Excel exportieren' : 'Export Excel'}
              </button>`;

c = c.slice(0, closeDiv) + btn + '\n          ' + c.slice(closeDiv);

fs.writeFileSync('src/features/portals/trainer/Grading.tsx', c, 'utf8');
console.log('DONE - size:', c.length);

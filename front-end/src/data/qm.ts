export const KPIS = [
  { de: 'Eingliederungsquote', en: 'Integration rate', val: '68%', tde: 'Ziel 60%', ten: 'Target 60%', ok: true, nde: '6 Monate nach Maßnahme', nen: '6 months after Bootcamp', pct: 68 },
  { de: 'Abbruchquote', en: 'Dropout rate', val: '14%', tde: 'Ziel unter 20%', ten: 'Target under 20%', ok: true, nde: 'laufendes Jahr', nen: 'current year', pct: 14 },
  { de: 'Bestehensquote', en: 'Pass rate', val: '86%', tde: 'Ziel 80%', ten: 'Target 80%', ok: true, nde: 'abgeschlossene Maßnahmen', nen: 'completed Bootcamps', pct: 86 },
  { de: 'Teilnehmerzufriedenheit', en: 'Satisfaction', val: '4,3/5', tde: 'Ziel 4,0', ten: 'Target 4.0', ok: true, nde: 'strukturierte Befragung', nen: 'structured survey', pct: 86 },
];

export const QM_DOCS = [
  { de: 'QM-Handbuch', en: 'QM handbook', ver: 'v4.2', author: 'H. Berger', approved: '12.02.2026', status: 'valid' },
  { de: 'Prozess: Anwesenheitskontrolle', en: 'Process: attendance check', ver: 'v2.1', author: 'H. Berger', approved: '05.01.2026', status: 'valid' },
  { de: 'Prozess: Beschwerdemanagement', en: 'Process: complaint handling', ver: 'v1.3', author: 'S. Okonkwo', approved: '20.11.2025', status: 'valid' },
  { de: 'Formular: Teilnahmevertrag', en: 'Form: participation contract', ver: 'v3.0', author: 'H. Berger', approved: '01.03.2026', status: 'valid' },
  { de: 'Prozess: Dozentenqualifikation', en: 'Process: trainer qualification', ver: 'v1.0', author: 'S. Okonkwo', approved: '—', status: 'inReview' },
];

export const PROC_EV = [
  { de: 'Anwesenheit wird wöchentlich geprüft', en: 'Attendance checked weekly', ede: '142 Anwesenheitsdatensätze diese Woche', een: '142 attendance records this week', ok: true },
  { de: 'Teilnehmerakten quartalsweise geprüft', en: 'Participant files checked quarterly', ede: '3 unvollständige Akten offen', een: '3 incomplete files open', ok: false },
  { de: 'Dozentenqualifikation vor Einsatz geprüft', en: 'Trainer qualification checked before use', ede: '1 Nachweis fehlt (S. Brandt)', een: '1 proof missing (S. Brandt)', ok: false },
  { de: 'Beschwerden innerhalb 14 Tagen bearbeitet', en: 'Complaints handled within 14 days', ede: 'Ø 6 Tage Bearbeitungszeit', een: 'avg. 6 days handling time', ok: true },
];

export const INIT_COMPLAINTS = [
  { date: '14.05.2026', src: 'Teilnehmer', cat: 'Organisation', desc: 'Raumwechsel kurzfristig', descEn: 'Late room change', owner: 'M. Schulz', due: '28.05.2026', status: 'open' },
  { date: '02.05.2026', src: 'Dozent', cat: 'Technik', desc: 'Online-Zugang instabil', descEn: 'Unstable online access', owner: 'IT', due: '10.05.2026', status: 'closed' },
  { date: '21.04.2026', src: 'Teilnehmer', cat: 'Inhalt', desc: 'Tempo zu hoch in Modul 3', descEn: 'Pace too fast in module 3', owner: 'Kursleitung', due: '05.05.2026', status: 'overdue' },
];

export const INT_AUDITS = [
  { date: '10.03.2026', tde: 'Internes Audit', ten: 'Internal audit', findings: '2', open: '0', status: 'completed' },
  { date: '15.06.2026', tde: 'Selbstbewertung', ten: 'Self-assessment', findings: '1', open: '1', status: 'inProgress' },
  { date: '12.08.2026', tde: 'Überwachungsaudit (extern)', ten: 'Surveillance audit (external)', findings: '—', open: '—', status: 'planned' },
];

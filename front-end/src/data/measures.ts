export const MASSNAHMEN = [
  { id: 'M1', name: 'Fachkraft Data Analytics', nr: '923/441/2024', azav: 'CQ-2024-0441', ue: 1200, mode: 'Hybrid', start: '15.01.2026', end: '10.07.2026', cap: 24, enrolled: 22, status: 'running', tl: { sig: 'g', doz: 'g', cert: 'a', compl: 'g' } },
  { id: 'M2', name: 'Web Development Bootcamp', nr: '923/512/2025', azav: 'CQ-2025-0512', ue: 960, mode: 'Präsenz', start: '03.03.2026', end: '28.08.2026', cap: 20, enrolled: 18, status: 'running', tl: { sig: 'a', doz: 'g', cert: 'g', compl: 'a' } },
  { id: 'M3', name: 'Cloud & DevOps Engineer', nr: '923/318/2024', azav: 'CQ-2024-0318', ue: 1100, mode: 'Online', start: '06.10.2025', end: '27.03.2026', cap: 18, enrolled: 15, status: 'finishing', tl: { sig: 'g', doz: 'a', cert: 'r', compl: 'g' } },
  { id: 'M4', name: 'Fachkraft Cybersecurity', nr: '923/603/2025', azav: 'CQ-2025-0603', ue: 1000, mode: 'Hybrid', start: '04.05.2026', end: '30.10.2026', cap: 20, enrolled: 0, status: 'planned', tl: { sig: 'g', doz: 'g', cert: 'g', compl: 'g' } },
];

export const CURRICULUM = [
  { de: 'Modul 1 · Grundlagen & Toolkit', en: 'Module 1 · Foundations & toolkit', ue: 120, status: 'g' },
  { de: 'Modul 2 · Datenaufbereitung (SQL, Python)', en: 'Module 2 · Data wrangling (SQL, Python)', ue: 280, status: 'g' },
  { de: 'Modul 3 · Statistik & Wahrscheinlichkeit', en: 'Module 3 · Statistics & probability', ue: 200, status: 'g' },
  { de: 'Modul 4 · Machine Learning Grundlagen', en: 'Module 4 · Machine learning basics', ue: 240, status: 'a' },
  { de: 'Modul 5 · Visualisierung & Reporting', en: 'Module 5 · Visualisation & reporting', ue: 160, status: 'p' },
  { de: 'Praxismodul · Betriebliche Projektphase', en: 'Praxis module · workplace project phase', ue: 320, status: 'p' },
];

export const CHANGELOG = [
  { date: '14.04.2026', de: 'Dozentenwechsel Modul 4', en: 'Trainer change module 4', who: 'H. Berger', rde: 'Krankheitsvertretung', ren: 'Sick cover' },
  { date: '02.03.2026', de: 'Raumänderung Präsenztage', en: 'Room change on-site days', who: 'M. Schulz', rde: 'Kapazität', ren: 'Capacity' },
];

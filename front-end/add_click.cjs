const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

// 1. Add setView to useApp destructuring
c = c.replace(
  "const { t, tasks, lang, widgets } = useApp();",
  "const { t, tasks, lang, widgets, setView } = useApp();"
);

// 2. Add view to clearItems type
c = c.replace(
  "const [clearItems, setClearItems] = useState<{ label: string; color: string }[]>([]);",
  "const [clearItems, setClearItems] = useState<{ label: string; color: string; view?: string }[]>([]);"
);

// 3. Add view to each item push
c = c.replace(
  "if (openCapa.length > 0) items.push({ label: lang === 'de' ? `${openCapa.length} offene CAPA` : `${openCapa.length} open CAPA`, color: C.rose });",
  "if (openCapa.length > 0) items.push({ label: lang === 'de' ? `${openCapa.length} offene CAPA` : `${openCapa.length} open CAPA`, color: C.rose, view: 'qm' });"
);
c = c.replace(
  "if (missingDocs > 0) items.push({ label: lang === 'de' ? `${missingDocs} fehlende Dokumente` : `${missingDocs} missing documents`, color: C.rose });",
  "if (missingDocs > 0) items.push({ label: lang === 'de' ? `${missingDocs} fehlende Dokumente` : `${missingDocs} missing documents`, color: C.rose, view: 'docs' });"
);
c = c.replace(
  "if (incompleteParts > 0) items.push({ label: lang === 'de' ? `${incompleteParts} unvollständige Teilnehmerakten` : `${incompleteParts} incomplete participant files`, color: C.amber });",
  "if (incompleteParts > 0) items.push({ label: lang === 'de' ? `${incompleteParts} unvollständige Teilnehmerakten` : `${incompleteParts} incomplete participant files`, color: C.amber, view: 'participants' });"
);

// 4. Add onClick to clearItems map
c = c.replace(
  "{clearItems.map((item, i) => (\n                <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '11px 0', borderTop: (i || tasks.length) ? `1px solid ${C.lineSoft}` : 'none' }}>",
  "{clearItems.map((item, i) => (\n                <div key={i} onClick={() => item.view && setView(item.view)} style={{ display: 'flex', gap: 11, alignItems: 'center', padding: '11px 0', borderTop: (i || tasks.length) ? `1px solid ${C.lineSoft}` : 'none', cursor: item.view ? 'pointer' : 'default' }}>"
);

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');

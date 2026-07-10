const fs = require('fs');
let c = fs.readFileSync('src/features/attendance/Sessions.tsx', 'utf8');

// Add participants state
c = c.replace(
  "  const [partsByMeas, setPartsByMeas] = useState<Record<string, number>>({});",
  "  const [partsByMeas, setPartsByMeas] = useState<Record<string, number>>({});\n  const [allParts,    setAllParts]    = useState<any[]>([]);"
);

// Store all participants
c = c.replace(
  "      setPartsByMeas(partMap);",
  "      setPartsByMeas(partMap);\n      setAllParts(parts);"
);

// Fix participants click to show names
c = c.replace(
  "() => { const parts: string[] = []; Object.entries(partsByMeas).forEach(([mId, count]) => { const m = measures.find((x: any) => x.id === mId); if (m && count > 0) parts.push(tMeasure(m) + ': ' + count + (de ? ' TN' : ' participants')); }); setStatsModal({ title: de ? 'Teilnehmer' : 'Participants', items: parts }); }",
  "() => setStatsModal({ title: de ? 'Teilnehmer' : 'Participants', items: allParts.map((p: any) => p.name + (p.contact ? ' — ' + p.contact : '')) })"
);

fs.writeFileSync('src/features/attendance/Sessions.tsx', c, 'utf8');
console.log('DONE');

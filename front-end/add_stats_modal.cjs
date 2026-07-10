const fs = require('fs');
let c = fs.readFileSync('src/features/attendance/Sessions.tsx', 'utf8');

// 1. Add modal state after existing state declarations
c = c.replace(
  "  const tMeasure = (m: any) => translateText(m?.name ?? '', lang);",
  "  const [statsModal, setStatsModal] = useState<{ title: string; items: string[] } | null>(null);\n  const tMeasure = (m: any) => translateText(m?.name ?? '', lang);"
);

// 2. Add onClick to top stats
c = c.replace(
  "            [<Layers size={13} />,        measures.length,  de ? 'Bootcamps'  : 'Bootcamps',    C.iris],\n            [<BookOpen size={13} />,      totalCourses,     de ? 'Kurse'      : 'Courses',      C.amber],\n            [<CalendarClock size={13} />, totalSessions,    de ? 'Sitzungen'  : 'Sessions',     C.mint],\n            [<Users size={13} />,         totalParts,       de ? 'Teilnehmer' : 'Participants', C.iris],\n          ].map(([icon, count, label, color]: any, i) => (\n            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, background: color + '12' }}>",
  "            [<Layers size={13} />,        measures.length,  de ? 'Bootcamps'  : 'Bootcamps',    C.iris,  () => setStatsModal({ title: de ? 'Bootcamps' : 'Bootcamps', items: measures.map(m => tMeasure(m)) })],\n            [<BookOpen size={13} />,      totalCourses,     de ? 'Kurse'      : 'Courses',      C.amber, () => setStatsModal({ title: de ? 'Kurse' : 'Courses', items: Object.values(courses).flat().map((c: any) => c.name) })],\n            [<CalendarClock size={13} />, totalSessions,    de ? 'Sitzungen'  : 'Sessions',     C.mint,  () => setStatsModal({ title: de ? 'Sitzungen' : 'Sessions', items: Object.values(sessions).flat().map((s: any) => s.title || s.id) })],\n            [<Users size={13} />,         totalParts,       de ? 'Teilnehmer' : 'Participants', C.iris,  null],\n          ].map(([icon, count, label, color, onClick]: any, i) => (\n            <div key={i} onClick={onClick || undefined} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, background: color + '12', cursor: onClick ? 'pointer' : 'default' }}>"
);

// 3. Add onClick to bootcamp row stats
c = c.replace(
  "                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>\n                    <BookOpen size={11} /> {mCourses.length} {de ? 'Kurse' : 'courses'}\n                  </span>\n                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>\n                    <CalendarClock size={11} /> {totalSess} {de ? 'Sitzungen' : 'sessions'}\n                  </span>",
  "                  <span onClick={(e) => { e.stopPropagation(); if(mCourses.length > 0) setStatsModal({ title: tMeasure(measure) + ' - ' + (de ? 'Kurse' : 'Courses'), items: mCourses.map((c: any) => c.name) }); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, cursor: mCourses.length > 0 ? 'pointer' : 'default', textDecoration: mCourses.length > 0 ? 'underline' : 'none' }}>\n                    <BookOpen size={11} /> {mCourses.length} {de ? 'Kurse' : 'courses'}\n                  </span>\n                  <span onClick={(e) => { e.stopPropagation(); if(totalSess > 0) setStatsModal({ title: tMeasure(measure) + ' - ' + (de ? 'Sitzungen' : 'Sessions'), items: mCourses.flatMap((co: any) => (sessions[co.id] ?? []).map((s: any) => s.title || s.id)) }); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, cursor: totalSess > 0 ? 'pointer' : 'default', textDecoration: totalSess > 0 ? 'underline' : 'none' }}>\n                    <CalendarClock size={11} /> {totalSess} {de ? 'Sitzungen' : 'sessions'}\n                  </span>"
);

// 4. Add modal before closing div
c = c.replace(
  "    </div>\n  );\n}",
  `    </div>

      {/* ===== STATS MODAL ===== */}
      {statsModal && (
        <div onClick={() => setStatsModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 420, padding: 0, overflow: 'hidden', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{statsModal.title}</div>
              <button onClick={() => setStatsModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={18} /></button>
            </div>
            <div style={{ overflowY: 'auto' }}>
              {statsModal.items.length === 0 && <div style={{ padding: 20, color: '#94A3B8', fontSize: 13 }}>{de ? 'Keine Einträge.' : 'No entries.'}</div>}
              {statsModal.items.map((item, i) => (
                <div key={i} style={{ padding: '10px 18px', borderBottom: '1px solid #F1F5F9', fontSize: 13, fontWeight: 500 }}>{item}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`
);

fs.writeFileSync('src/features/attendance/Sessions.tsx', c, 'utf8');
console.log('DONE');

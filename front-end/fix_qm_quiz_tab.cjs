const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');

// 1. Add quiz to TABS array before the last one
c = c.replace(
  "    { id: 'capa',",
  "    { id: 'quiz',  label: de ? 'Quiz-Übersicht' : 'Quiz Overview', icon: <span style={{fontSize:13}}>??</span> },\n    { id: 'capa',"
);

// 2. Add quiz state
c = c.replace(
  "  const [capaRows,    setCapaRows]    = useState<any[]>([]);",
  "  const [capaRows,    setCapaRows]    = useState<any[]>([]);\n  const [quizStats,   setQuizStats]   = useState<any>(null);\n  const [quizMeasure, setQuizMeasure] = useState('');"
);

// 3. Fetch quiz stats when tab = quiz
c = c.replace(
  "  }, []);",
  "  }, []);\n  useEffect(() => {\n    if (tab !== 'quiz') return;\n    const url = quizMeasure ? '/quiz/stats?measureId=' + quizMeasure : '/quiz/stats';\n    api(url).then((s: any) => setQuizStats(s)).catch(() => {});\n  }, [tab, quizMeasure]);"
);

// 4. Add quiz tab content before CAPA TAB comment
const quizTab = `      {/* ===== QUIZ TAB ===== */}
      {tab === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select value={quizMeasure} onChange={e => setQuizMeasure(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' }}>
              <option value="">{de ? 'Alle Bootcamps' : 'All Bootcamps'}</option>
              {apiMeasures.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          {quizStats ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
              {[
                { label: de ? 'Quizzes gesamt' : 'Total Quizzes',   val: quizStats.totalQuizzes,   color: C.iris },
                { label: de ? 'Versuche gesamt' : 'Total Attempts',  val: quizStats.totalAttempts,  color: C.amber },
                { label: de ? 'Bestanden' : 'Pass Count',            val: quizStats.passCount,      color: C.mint },
                { label: de ? 'Bestandsquote' : 'Pass Rate',         val: quizStats.passRate + '%', color: quizStats.passRate >= 50 ? C.mint : C.rose },
              ].map((kpi, i) => (
                <div key={i} className="card" style={{ padding: '18px 16px' }}>
                  <div style={{ fontSize: 11.5, color: C.muted, marginBottom: 6 }}>{kpi.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color }}>{kpi.val}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: C.muted, fontSize: 13 }}>{de ? 'Lädt…' : 'Loading…'}</div>
          )}
        </div>
      )}`;

c = c.replace(
  "{/* ===== AUDIT TAB ===== */}",
  quizTab + "\n\n      {/* ===== AUDIT TAB ===== */}"
);

fs.writeFileSync('src/features/qm/QM.tsx', c, 'utf8');
console.log('DONE');

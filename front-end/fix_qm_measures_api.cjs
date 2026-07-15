const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');

// 1. Add apiMeasures state
c = c.replace(
  "  const [quizMeasure, setQuizMeasure] = useState('');",
  "  const [quizMeasure, setQuizMeasure] = useState('');\n  const [apiMeasures,  setApiMeasures]  = useState<any[]>([]);"
);

// 2. Load measures in existing useEffect
c = c.replace(
  "  useEffect(() => {\n    if (tab !== 'quiz') return;",
  "  useEffect(() => {\n    api('/measures').then((m: any) => setApiMeasures(Array.isArray(m) ? m : [])).catch(() => {});\n  }, []);\n\n  useEffect(() => {\n    if (tab !== 'quiz') return;"
);

// 3. Replace MASSNAHMEN in quiz dropdown with apiMeasures
c = c.replace(
  "{apiMeasures.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}",
  "{apiMeasures.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}"
);

fs.writeFileSync('src/features/qm/QM.tsx', c, 'utf8');
console.log('DONE');
console.log('Has apiMeasures state:', c.includes("useState<any[]>([]); // measures"));

const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// Fix bootcampNames to use measureList
c = c.replace(
  "const bootcampNames = useMemo(() => [...new Set(alumni.map((a: any) => a.measure ?? a.m).filter(Boolean))], [alumni]);",
  "const bootcampNames = useMemo(() => measures.map((m: any) => m.name).filter(Boolean), [measures]);"
);

// Add measures state if missing
if (!c.includes("const [measures,")) {
  c = c.replace(
    "  const [alumni,        setAlumni]",
    "  const [measures,      setMeasures]      = useState<any[]>([]);\n  const [alumni,        setAlumni]"
  );
}

// Add setMeasures in load
c = c.replace(
  "const measureList   = Array.isArray(measures)    ? measures   : [];",
  "const measureList   = Array.isArray(measures)    ? measures   : [];\n      setMeasures(measureList);"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

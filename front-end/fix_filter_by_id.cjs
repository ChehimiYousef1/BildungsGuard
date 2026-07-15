const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// Change filter to use measureId
c = c.replace(
  "const filteredAlumni = filterMeasure ? alumni.filter((a: any) => (a.measure ?? a.m) === filterMeasure) : alumni;",
  "const filteredAlumni = filterMeasure ? alumni.filter((a: any) => a.measureId === filterMeasure) : alumni;"
);

// Change bootcampNames to use id as value and name as label
c = c.replace(
  "const bootcampNames = useMemo(() => measures.map((m: any) => m.name).filter(Boolean), [measures]);",
  "const bootcampNames = useMemo(() => measures.filter((m: any) => m.name), [measures]);"
);

// Fix dropdown to show name but use id as value
c = c.replace(
  "{bootcampNames.map((m: any) => <option key={m} value={m}>{m}</option>)}",
  "{bootcampNames.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

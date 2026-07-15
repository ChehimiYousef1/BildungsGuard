const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// Fix bootcampNames to use 'm' field instead of 'measure'
c = c.replace(
  "const bootcampNames = useMemo(() => [...new Set(alumni.map((a: any) => a.measure).filter(Boolean))], [alumni]);",
  "const bootcampNames = useMemo(() => [...new Set(alumni.map((a: any) => a.measure ?? a.m).filter(Boolean))], [alumni]);"
);

// Fix filteredAlumni to check both measure and m
c = c.replace(
  "const filteredAlumni = filterMeasure ? alumni.filter((a: any) => a.measure === filterMeasure) : alumni;",
  "const filteredAlumni = filterMeasure ? alumni.filter((a: any) => (a.measure ?? a.m) === filterMeasure) : alumni;"
);

// Fix exportExcel to use correct field
c = c.replace(
  "Bootcamp: a.measure ?? '',",
  "Bootcamp: a.measure ?? a.m ?? '',"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

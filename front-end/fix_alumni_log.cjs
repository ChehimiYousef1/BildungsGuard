const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

c = c.replace(
  "const load = async () => {",
  "const load = async () => {\n    console.log('[Alumni] loading...');"
);

c = c.replace(
  "setAlumni(Array.isArray(data) ? data : []);",
  "setAlumni(Array.isArray(data) ? data : []);\n      console.log('[Alumni] loaded:', Array.isArray(data) ? data.length : 0, data?.[0]);"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

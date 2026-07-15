const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// Add error logging in catch
c = c.replace(
  "      setAlumni([]);",
  "      console.error('[Alumni] load FAILED:', e);\n      setAlumni([]);"
);

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/routes.tsx', 'utf8');

const lines = c.split('\n');
const seen = new Set();
const filtered = lines.filter(line => {
  if (line.includes("import AdminSupport") || line.includes("import UserSupport")) {
    if (seen.has(line.trim())) return false;
    seen.add(line.trim());
  }
  return true;
});

fs.writeFileSync('src/routes.tsx', filtered.join('\n'), 'utf8');
console.log('DONE');

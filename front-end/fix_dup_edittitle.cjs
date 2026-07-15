const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');
const lines = c.split('\n');

// Find all editTitle state declarations and keep only first
let found = false;
const filtered = lines.filter(line => {
  if (line.includes('[editTitle,') && line.includes('useState')) {
    if (found) { console.log('Removed duplicate:', line.trim()); return false; }
    found = true;
  }
  return true;
});

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', filtered.join('\n'), 'utf8');
console.log('DONE');

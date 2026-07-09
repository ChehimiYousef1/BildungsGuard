const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

// Find and remove the integration rate card block
const start = c.indexOf('{integrationRate !== null && widgets.stats && (');
if (start > -1) {
  // Find matching closing )}
  let depth = 0;
  let i = start;
  let end = -1;
  while (i < c.length) {
    if (c[i] === '(') depth++;
    if (c[i] === ')') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
    i++;
  }
  if (end > -1) {
    c = c.slice(0, start) + c.slice(end);
    console.log('Integration rate card removed OK');
  } else {
    console.log('End not found');
  }
} else {
  console.log('Block not found');
}

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');

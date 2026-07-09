const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

// Remove the Integration rate Stat
c = c.replace(/\s*<Stat\s*\n\s*icon=\{<TrendingUp[^}]+\}[^/]*\/>/gs, '');
c = c.replace(/\s*<Stat\n[^<]*TrendingUp[^<]*<\/Stat>/gs, '');

// Simpler: find and remove the specific block
const start = c.indexOf('<Stat\n            icon={<TrendingUp');
if (start > -1) {
  const end = c.indexOf('/>', start) + 2;
  c = c.slice(0, start) + c.slice(end);
  console.log('Removed Integration rate stat');
} else {
  // Try single line
  const idx = c.indexOf("label={lang === 'de' ? 'Eingliederungsquote' : 'Integration rate'}");
  if (idx > -1) {
    const blockStart = c.lastIndexOf('<Stat', idx);
    const blockEnd = c.indexOf('/>', idx) + 2;
    c = c.slice(0, blockStart) + c.slice(blockEnd);
    console.log('Removed via label search');
  } else {
    console.log('Not found');
  }
}

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');

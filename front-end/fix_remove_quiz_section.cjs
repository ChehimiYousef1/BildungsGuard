const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');
const lines = c.split('\n');

// Find and remove the entire Quiz list section
const startIdx = lines.findIndex(l => l.includes('{/* Quiz list */}'));
if (startIdx === -1) { console.log('Not found'); process.exit(0); }

// Find matching closing )} 
let depth = 0, endIdx = -1;
for (let i = startIdx; i < lines.length; i++) {
  for (const ch of lines[i]) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
  }
  if (depth <= 0 && i > startIdx) { endIdx = i; break; }
}

console.log('Removing lines:', startIdx + 1, 'to', endIdx + 1);
lines.splice(startIdx, endIdx - startIdx + 1);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', lines.join('\n'), 'utf8');
console.log('DONE');

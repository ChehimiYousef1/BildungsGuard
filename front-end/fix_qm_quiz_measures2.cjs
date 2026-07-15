const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');

// Replace MASSNAHMEN with apiMeasures from QM state
// QM already loads measures - check what variable name it uses
const measMatch = c.match(/const \[(\w+),\s*set\w+\]\s*=\s*useState<any\[\]>\(\[\]\);.*?measure/s);
console.log('Looking for measures state...');

// Find the measures variable in QM
const lines = c.split('\n');
for (let i = 0; i < 50; i++) {
  if (lines[i].includes('useState') && lines[i].toLowerCase().includes('measure')) {
    console.log('Line', i+1, ':', lines[i].trim());
  }
}

// Replace MASSNAHMEN with dynamic measures from QM state
c = c.replace(
  "{(Array.isArray(MASSNAHMEN) ? MASSNAHMEN : []).map((m: any) => <option key={m.id ?? m.name} value={m.id ?? m.name}>{m.name}</option>)}",
  "{apiMeasures.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}"
);

fs.writeFileSync('src/features/qm/QM.tsx', c, 'utf8');
console.log('DONE');

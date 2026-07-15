const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');

// Find what measures state is called
const match = c.match(/const \[(\w+),\s*\w+\]\s*=\s*useState.*\[\]/);
console.log('Checking measures variable...');

// Replace apiMeasures with MASSNAHMEN (static data already imported)
c = c.replace(
  "{apiMeasures.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}",
  "{(Array.isArray(MASSNAHMEN) ? MASSNAHMEN : []).map((m: any) => <option key={m.id ?? m.name} value={m.id ?? m.name}>{m.name}</option>)}"
);

fs.writeFileSync('src/features/qm/QM.tsx', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

// Remove second occurrence of modalParts and modalOpen
const first = c.indexOf('const [modalParts, setModalParts]');
const second = c.indexOf('const [modalParts, setModalParts]', first + 1);
if (second > -1) {
  const lineStart = c.lastIndexOf('\n', second);
  const nextLine = c.indexOf('\n', second);
  const nextNextLine = c.indexOf('\n', nextLine + 1);
  c = c.slice(0, lineStart) + c.slice(nextNextLine);
  console.log('Removed duplicate modalParts');
}

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');

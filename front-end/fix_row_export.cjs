const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');
const lines = c.split('\n');

// Remove export button from line 528 (index 527)
const oldLine = lines[527];
const btnStart = oldLine.indexOf(' <button className="btn btn-ghost"');
const btnEnd = oldLine.indexOf('</button>', btnStart) + 9;
if (btnStart > -1 && btnEnd > 8) {
  lines[527] = oldLine.slice(0, btnStart) + oldLine.slice(btnEnd);
  console.log('Removed export button from row function');
}

fs.writeFileSync('src/features/documents/DocumentModel.tsx', lines.join('\n'), 'utf8');
console.log('DONE');

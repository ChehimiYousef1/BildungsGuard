const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');
const lines = c.split('\n');

// Remove the misplaced modal lines (362-367, index 361-366)
const startIdx = lines.findIndex(l => l.includes('{showQuizModal && ('));
const endIdx   = lines.findIndex(l => l.includes('      )}') && lines.indexOf(l) > startIdx);

if (startIdx > -1 && endIdx > -1) {
  const modal = lines.splice(startIdx, endIdx - startIdx + 1);
  console.log('Removed modal from:', startIdx + 1, 'to:', endIdx + 1);
  
  // Find the </div> before ); and insert before it
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === '</div>' || lines[i].trim() === '</>') {
      lines.splice(i, 0, ...modal);
      console.log('Inserted modal at line:', i + 1);
      break;
    }
  }
}

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', lines.join('\n'), 'utf8');
console.log('DONE');

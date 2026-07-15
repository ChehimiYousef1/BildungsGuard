const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/QuizModal.tsx', 'utf8');
const lines = c.split('\n');

lines[104] = "        headers: { Authorization: `Bearer ${getToken()}` },";

fs.writeFileSync('src/features/portals/trainer/QuizModal.tsx', lines.join('\n'), 'utf8');
console.log('DONE - line 105:', lines[104]);

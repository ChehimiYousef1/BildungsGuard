const fs = require('fs');
let c = fs.readFileSync('src/features/trainers/Trainers.tsx', 'utf8');

// Remove setCvFile from openAddForm
c = c.replace("    setCvFile(null);\n", "");
c = c.replace("    setCvFile(null);\r\n", "");

fs.writeFileSync('src/features/trainers/Trainers.tsx', c, 'utf8');
console.log('DONE');
console.log('setCvFile remaining:', c.includes('setCvFile'));

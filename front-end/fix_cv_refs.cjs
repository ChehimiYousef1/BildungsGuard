const fs = require('fs');
let c = fs.readFileSync('src/features/trainers/Trainers.tsx', 'utf8');

// Remove all setCvFile references
c = c.split('\n').filter(line => !line.includes('setCvFile') && !line.includes('cvFile') && !line.includes('cvInputRef') && !line.includes('uploadCv')).join('\n');

fs.writeFileSync('src/features/trainers/Trainers.tsx', c, 'utf8');
console.log('setCvFile remaining:', c.includes('setCvFile'));
console.log('cvFile remaining:', c.includes('cvFile'));
console.log('DONE');

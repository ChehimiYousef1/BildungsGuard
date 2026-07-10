const fs = require('fs');
let c = fs.readFileSync('src/features/trainers/Trainers.tsx', 'utf8');

// Add email and password to trainer POST payload
c = c.replace(
  "body: JSON.stringify({ name: form.name.trim(), qualificationArea: form.qualificationArea.trim() || undefined, qualificationStatus: 'incomplete' }),",
  "body: JSON.stringify({ name: form.name.trim(), qualificationArea: form.qualificationArea.trim() || undefined, qualificationStatus: 'incomplete', email: form.email.trim(), password: form.password }),"
);

fs.writeFileSync('src/features/trainers/Trainers.tsx', c, 'utf8');
console.log('DONE');

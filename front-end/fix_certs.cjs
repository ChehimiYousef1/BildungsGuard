const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Certificates.tsx', 'utf8');

// Find the "no grades" section and replace with dynamic grades display
const noGradesIdx = c.indexOf('Your trainer has not entered any grades yet');
if (noGradesIdx > -1) {
  const lineNum = c.slice(0, noGradesIdx).split('\n').length;
  console.log('No grades text at line:', lineNum);
}

// Replace the grades section - show all grades from surveys
c = c.replace(
  "grades.length === 0",
  "grades.length === 0 && certs.length === 0"
);

fs.writeFileSync('src/features/portals/participant/Certificates.tsx', c, 'utf8');
console.log('DONE');

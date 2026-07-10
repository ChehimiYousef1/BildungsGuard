const fs = require('fs');
const path = require('path');

const files = [
  'src/features/participants/PrivacyConsent.tsx',
  'src/features/participants/MediaConsent.tsx',
  'src/features/participants/SickNote.tsx',
  'src/features/participants/CV.tsx',
  'src/features/participants/Certificate.tsx',
  'src/features/participants/AttendanceRecord.tsx',
  'src/features/participants/CourseTeachingLog.tsx',
];

let fixed = 0;
files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  if (c.includes('/file`')) {
    c = c.replace(/\/documents\/\$\{[^}]+\}\/file`/g, (m) => m.replace('/file`', '/upload`'));
    fs.writeFileSync(f, c, 'utf8');
    console.log('Fixed:', f);
    fixed++;
  }
});
console.log('Fixed', fixed, 'files');

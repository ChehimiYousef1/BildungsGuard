const fs = require('fs');
let c = fs.readFileSync('src/features/trainers/Trainers.tsx', 'utf8');

// Remove the upload button row that uses uploading and rowUploadRef
c = c.replace(/\s*<input[^>]*rowUploadRef[^>]*\/>/g, '');
c = c.replace(/\s*<button[^>]*disabled=\{uploading[^}]+\}[^>]*>[\s\S]*?<\/button>/g, '');
c = c.replace(/\s*rowUploadRef\.current\[d\.id\][^\n]+\n/g, '');

fs.writeFileSync('src/features/trainers/Trainers.tsx', c, 'utf8');

// Verify
const remaining = c.includes('uploading') || c.includes('rowUploadRef');
console.log('Still has refs:', remaining);
console.log('DONE');

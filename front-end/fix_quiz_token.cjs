const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/QuizModal.tsx', 'utf8');

c = c.replace(
  "Authorization: `Bearer ${localStorage.getItem('token')}`",
  "Authorization: `Bearer ${localStorage.getItem('aio_token')}`"
);

fs.writeFileSync('src/features/portals/trainer/QuizModal.tsx', c, 'utf8');
console.log('DONE');

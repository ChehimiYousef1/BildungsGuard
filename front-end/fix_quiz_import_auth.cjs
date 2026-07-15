const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/QuizModal.tsx', 'utf8');

// Use getToken from api instead of localStorage directly
c = c.replace(
  "import { api } from '../../../lib/api';",
  "import { api, getToken } from '../../../lib/api';"
);

c = c.replace(
  "Authorization: `Bearer ${localStorage.getItem('aio_token')}`",
  "Authorization: `Bearer ${getToken()}`"
);

fs.writeFileSync('src/features/portals/trainer/QuizModal.tsx', c, 'utf8');
console.log('DONE');

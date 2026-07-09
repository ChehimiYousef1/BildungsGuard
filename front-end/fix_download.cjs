const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Count Download occurrences in imports
const matches = c.match(/Download/g);
console.log('Download count:', matches ? matches.length : 0);

// Remove duplicate Download from lucide import
let fixed = false;
c = c.replace(/, Download\n\} from 'lucide-react';/, "\n} from 'lucide-react';");
c = c.replace(/, Download\r\n\} from 'lucide-react';/, "\r\n} from 'lucide-react';");
c = c.replace(/, Download\} from 'lucide-react';/, "} from 'lucide-react';");

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/config/nav.ts', 'utf8');

// Remove audit from navbar
c = c.replace(
  "['audit', 'n_audit', FolderCheck], ",
  ""
);

fs.writeFileSync('src/config/nav.ts', c, 'utf8');
console.log('DONE');

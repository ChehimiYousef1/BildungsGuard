const fs = require('fs');
let c = fs.readFileSync('src/config/nav.ts', 'utf8');

// Add support before settings in verwaltung
c = c.replace(
  "['settings', 'n_settings', Settings]],\n  dozent:",
  "['support', 'n_support', MessageSquare], ['settings', 'n_settings', Settings]],\n  dozent:"
);

fs.writeFileSync('src/config/nav.ts', c, 'utf8');
console.log('DONE');

const fs = require('fs');

// Add n_support to de.ts
let de = fs.readFileSync('src/i18n/de.ts', 'utf8');
de = de.replace("n_settings: 'Einstellungen'", "n_support: 'Support & Feedback', n_settings: 'Einstellungen'");
fs.writeFileSync('src/i18n/de.ts', de, 'utf8');
console.log('de.ts fixed');

// Add n_support to en.ts
let en = fs.readFileSync('src/i18n/en.ts', 'utf8');
en = en.replace("n_settings: 'Settings'", "n_support: 'Support & Feedback', n_settings: 'Settings'");
fs.writeFileSync('src/i18n/en.ts', en, 'utf8');
console.log('en.ts fixed');

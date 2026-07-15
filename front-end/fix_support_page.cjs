const fs = require('fs');

// 1. Add to routes
let r = fs.readFileSync('src/routes.tsx', 'utf8');
if (!r.includes('support')) {
  r = r.replace(
    "import SettingsView",
    "import SupportView from './features/support/Support';\nimport SettingsView"
  );
  r = r.replace(
    "case 'verwaltung/settings':",
    "case 'verwaltung/support': return <SupportView />;\n    case 'verwaltung/settings':"
  );
  fs.writeFileSync('src/routes.tsx', r, 'utf8');
  console.log('Routes fixed');
}

// 2. Add translation key
let t = fs.readFileSync('src/i18n/de.ts', 'utf8').catch ? null : null;
console.log('Routes done');

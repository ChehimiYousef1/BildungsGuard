const fs = require('fs');
let c = fs.readFileSync('src/routes.tsx', 'utf8');

// Add imports
c = c.replace(
  "import SettingsView from './features/settings/Settings';",
  "import AdminSupport from './features/support/AdminSupport';\nimport UserSupport from './features/support/UserSupport';\nimport SettingsView from './features/settings/Settings';"
);

// Add routes - remove old support route if exists
c = c.replace("case 'verwaltung/support': return <SupportView />;", '');

// Add new routes before settings
c = c.replace(
  "case 'verwaltung/settings':",
  "case 'verwaltung/support': return <AdminSupport />;\n    case 'dozent/support':     return <UserSupport role=\"trainer\" />;\n    case 'teilnehmer/support': return <UserSupport role=\"participant\" />;\n    case 'verwaltung/settings':"
);

fs.writeFileSync('src/routes.tsx', c, 'utf8');
console.log('DONE');

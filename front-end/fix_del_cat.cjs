const fs = require('fs');

// 1. Remove from nav
let nav = fs.readFileSync('src/config/nav.ts', 'utf8');
nav = nav.replace("['categories', 'n_categories', Tags], ", "");
nav = nav.replace(", ['categories', 'n_categories', Tags]", "");
fs.writeFileSync('src/config/nav.ts', nav, 'utf8');

// 2. Remove from routes
let routes = fs.readFileSync('src/routes.tsx', 'utf8');
routes = routes.replace("import Categories from './features/categories/Categories';\n", "");
routes = routes.replace("    case 'verwaltung/categories': return <Categories />;\n", "");
fs.writeFileSync('src/routes.tsx', routes, 'utf8');

console.log('DONE');

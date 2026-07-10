const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.service.ts', 'utf8');

c = c.replace(
  "    if (email && password) {",
  "    console.log('[Trainer] email:', email, '| password:', password ? 'SET' : 'MISSING');\n    if (email && password) {"
);

c = c.replace(
  "      } catch (e) { console.error('Email failed:', e); }",
  "      } catch (e) { console.error('[Trainer] Email failed:', e.message); }"
);

fs.writeFileSync('src/trainers/trainers.service.ts', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/app.module.ts', 'utf8');

// Add TrainersModule import
c = c.replace(
  "import { Module }",
  "import { TrainersModule } from './trainers/trainers.module';\nimport { Module }"
);

// Add to imports array
const importsIdx = c.indexOf('imports: [');
if (importsIdx > -1) {
  const insertAt = c.indexOf('[', importsIdx) + 1;
  c = c.slice(0, insertAt) + '\n    TrainersModule,' + c.slice(insertAt);
  console.log('Added TrainersModule to imports');
}

fs.writeFileSync('src/app.module.ts', c, 'utf8');
console.log('DONE');

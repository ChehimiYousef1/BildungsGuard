const fs = require('fs');
let c = fs.readFileSync('src/app.module.ts', 'utf8');

c = c.replace(
  "import { SupportModule } from './support/support.module';",
  "import { SupportModule } from './support/support.module';\nimport { QuizModule } from './quiz/quiz.module';"
);

c = c.replace(
  "SupportModule,",
  "SupportModule,\n    QuizModule,"
);

fs.writeFileSync('src/app.module.ts', c, 'utf8');
console.log('DONE');

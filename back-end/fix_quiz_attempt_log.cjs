const fs = require('fs');
let c = fs.readFileSync('src/quiz/quiz.service.ts', 'utf8');

c = c.replace(
  "  async submitAttempt(",
  "  async submitAttempt("
);

// Add try/catch logging around survey creation
c = c.replace(
  "    const [attempt] = await Promise.all([",
  "    console.log('[Quiz Submit] score:', score, '/', total, '| passed:', passed, '| pid:', participantId);\n    const [attempt] = await Promise.all(["
);

c = c.replace(
  "      // Auto-save as Survey so Progress.tsx and Certificates.tsx reflect it\n      this.prisma.client.survey.create({",
  "      // Auto-save as Survey\n      this.prisma.client.survey.create({"
);

fs.writeFileSync('src/quiz/quiz.service.ts', c, 'utf8');
console.log('DONE');

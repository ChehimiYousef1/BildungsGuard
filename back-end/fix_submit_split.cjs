const fs = require('fs');
let c = fs.readFileSync('src/quiz/quiz.service.ts', 'utf8');
const lines = c.split('\n');

// Find the Promise.all line
const paIdx = lines.findIndex(l => l.includes('Promise.all(['));
if (paIdx === -1) { console.log('Promise.all not found'); process.exit(1); }

// Find end of Promise.all block
let depth = 0, endIdx = -1;
for (let i = paIdx; i < lines.length; i++) {
  for (const ch of lines[i]) {
    if (ch === '[' || ch === '(') depth++;
    if (ch === ']' || ch === ')') depth--;
  }
  if (depth <= 0 && i > paIdx) { endIdx = i; break; }
}
console.log('Promise.all:', paIdx + 1, 'to', endIdx + 1);

// Replace with sequential try/catch
const newCode = [
  "    let attempt;",
  "    try {",
  "      attempt = await this.prisma.client.quizAttempt.create({",
  "        data: { quizId, participantId, score, total, passed, answers: answers as any, tenantId },",
  "      });",
  "      console.log('[Quiz] attempt saved');",
  "    } catch(e: any) { console.error('[Quiz] attempt FAILED:', e.message); throw e; }",
  "    try {",
  "      await this.prisma.client.survey.create({",
  "        data: { participantId, type: 'test', title: quiz.title, score: `${score}/${total}`, rating: Math.round(pct / 20), maxRating: 5, surveyDate: new Date().toLocaleDateString('de-DE'), tenantId },",
  "      });",
  "      console.log('[Quiz] survey saved');",
  "    } catch(e: any) { console.error('[Quiz] survey FAILED:', e.message); }",
];

lines.splice(paIdx, endIdx - paIdx + 1, ...newCode);
fs.writeFileSync('src/quiz/quiz.service.ts', lines.join('\n'), 'utf8');
console.log('DONE - lines replaced:', endIdx - paIdx + 1, '->', newCode.length);

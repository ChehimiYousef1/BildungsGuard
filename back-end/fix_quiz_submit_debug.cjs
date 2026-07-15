const fs = require('fs');
let c = fs.readFileSync('src/quiz/quiz.service.ts', 'utf8');

c = c.replace(
  "    console.log('[Quiz Submit] score:', score, '/', total, '| passed:', passed, '| pid:', participantId);\n    const [attempt] = await Promise.all([\n      this.prisma.client.quizAttempt.create({\n        data: { quizId, participantId, score, total, passed, answers: answers as any, tenantId },\n      }),\n      // Auto-save as Survey\n      this.prisma.client.survey.create({\n        data: {\n          participantId,\n          type:       'test',\n          title:      quiz.title,\n          score:      `${score}/${total}`,\n          rating:     Math.round(pct / 20),\n          maxRating:  5,\n          surveyDate: new Date().toLocaleDateString('de-DE'),\n          tenantId,\n        },\n      }),\n    ]);",
  "    console.log('[Quiz Submit] score:', score, '/', total, '| passed:', passed, '| pid:', participantId);\n    let attempt;\n    try {\n      attempt = await this.prisma.client.quizAttempt.create({\n        data: { quizId, participantId, score, total, passed, answers: answers as any, tenantId },\n      });\n      console.log('[Quiz Submit] attempt saved OK');\n    } catch(e) { console.error('[Quiz Submit] attempt FAILED:', e.message); throw e; }\n    try {\n      await this.prisma.client.survey.create({\n        data: { participantId, type: 'test', title: quiz.title, score: `${score}/${total}`, rating: Math.round(pct / 20), maxRating: 5, surveyDate: new Date().toLocaleDateString('de-DE'), tenantId },\n      });\n      console.log('[Quiz Submit] survey saved OK');\n    } catch(e) { console.error('[Quiz Submit] survey FAILED:', e.message); }"
);

fs.writeFileSync('src/quiz/quiz.service.ts', c, 'utf8');
console.log('DONE');

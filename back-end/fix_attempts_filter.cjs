const fs = require('fs');
let c = fs.readFileSync('src/quiz/quiz.service.ts', 'utf8');

// Don't filter by participantId for participants - let frontend filter
c = c.replace(
  "  async getAttempts(tenantId: string, quizId: string, user?: any) {\n    const where: any = { quizId, tenantId };\n    if (user?.role === 'participant') {\n      where.participantId = user.userId ?? user.id;\n    }\n    return this.prisma.client.quizAttempt.findMany({\n      where,\n      orderBy: { createdAt: 'desc' },\n    });\n  }",
  "  async getAttempts(tenantId: string, quizId: string, user?: any) {\n    return this.prisma.client.quizAttempt.findMany({\n      where: { quizId, tenantId },\n      orderBy: { createdAt: 'desc' },\n    });\n  }"
);

fs.writeFileSync('src/quiz/quiz.service.ts', c, 'utf8');
console.log('DONE');

const fs = require('fs');

// Add to controller
let c = fs.readFileSync('src/quiz/quiz.controller.ts', 'utf8');
c = c.replace(
  "  @Delete(':id/attempts/:participantId')",
  "  @Get(':id/attempts')\n  @Roles(AppRole.Admin, AppRole.Trainer)\n  getAttempts(@CurrentTenant() t: string, @Param('id') id: string) {\n    return this.service.getAttempts(t, id);\n  }\n\n  @Delete(':id/attempts/:participantId')"
);
fs.writeFileSync('src/quiz/quiz.controller.ts', c, 'utf8');
console.log('Controller DONE');

// Add to service
let s = fs.readFileSync('src/quiz/quiz.service.ts', 'utf8');
s = s.replace(
  "  async resetAttempt(",
  "  async getAttempts(tenantId: string, quizId: string) {\n    return this.prisma.client.quizAttempt.findMany({\n      where: { quizId, tenantId },\n      orderBy: { createdAt: 'desc' },\n    });\n  }\n\n  async resetAttempt("
);
fs.writeFileSync('src/quiz/quiz.service.ts', s, 'utf8');
console.log('Service DONE');

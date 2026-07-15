const fs = require('fs');
let c = fs.readFileSync('src/quiz/quiz.controller.ts', 'utf8');

// Add reset endpoint
c = c.replace(
  "  @Post(':id/attempt')",
  "  @Delete(':id/attempts/:participantId')\n  @Roles(AppRole.Admin, AppRole.Trainer)\n  resetAttempt(\n    @CurrentTenant() t: string,\n    @Param('id') id: string,\n    @Param('participantId') participantId: string,\n  ) {\n    return this.service.resetAttempt(t, id, participantId);\n  }\n\n  @Post(':id/attempt')"
);

fs.writeFileSync('src/quiz/quiz.controller.ts', c, 'utf8');
console.log('Controller DONE');

// Add resetAttempt to service
let s = fs.readFileSync('src/quiz/quiz.service.ts', 'utf8');
s = s.replace(
  "  getTemplate() {",
  "  async resetAttempt(tenantId: string, quizId: string, participantId: string) {\n    await this.prisma.client.quizAttempt.deleteMany({\n      where: { quizId, participantId, tenantId },\n    });\n    return { reset: true };\n  }\n\n  getTemplate() {"
);
fs.writeFileSync('src/quiz/quiz.service.ts', s, 'utf8');
console.log('Service DONE');

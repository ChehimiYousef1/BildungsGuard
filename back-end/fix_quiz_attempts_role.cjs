const fs = require('fs');
let c = fs.readFileSync('src/quiz/quiz.controller.ts', 'utf8');

// Allow participant to get their own attempts
c = c.replace(
  "  @Get(':id/attempts')\n  @Roles(AppRole.Admin, AppRole.Trainer)\n  getAttempts(@CurrentTenant() t: string, @Param('id') id: string) {\n    return this.service.getAttempts(t, id);\n  }",
  "  @Get(':id/attempts')\n  @Roles(AppRole.Admin, AppRole.Trainer, AppRole.Participant)\n  getAttempts(\n    @CurrentTenant() t: string,\n    @Param('id') id: string,\n    @CurrentUser() user: any,\n  ) {\n    return this.service.getAttempts(t, id, user);\n  }"
);

fs.writeFileSync('src/quiz/quiz.controller.ts', c, 'utf8');
console.log('Controller DONE');

// Update service to filter by participant if role is participant
let s = fs.readFileSync('src/quiz/quiz.service.ts', 'utf8');
s = s.replace(
  "  async getAttempts(tenantId: string, quizId: string) {\n    return this.prisma.client.quizAttempt.findMany({\n      where: { quizId, tenantId },\n      orderBy: { createdAt: 'desc' },\n    });\n  }",
  "  async getAttempts(tenantId: string, quizId: string, user?: any) {\n    const where: any = { quizId, tenantId };\n    if (user?.role === 'participant') {\n      where.participantId = user.userId ?? user.id;\n    }\n    return this.prisma.client.quizAttempt.findMany({\n      where,\n      orderBy: { createdAt: 'desc' },\n    });\n  }"
);
fs.writeFileSync('src/quiz/quiz.service.ts', s, 'utf8');
console.log('Service DONE');

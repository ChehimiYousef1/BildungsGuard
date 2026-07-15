const fs = require('fs');
let c = fs.readFileSync('src/quiz/quiz.service.ts', 'utf8');

// After saving survey, auto-create alumni if passed
c = c.replace(
  "      console.log('[Quiz] survey saved');",
  "      console.log('[Quiz] survey saved');\n    // Auto-create alumni if passed\n    if (passed) {\n      try {\n        const participant = await this.prisma.client.participant.findFirst({\n          where: { id: participantId, tenantId },\n          include: { measure: true },\n        });\n        if (participant) {\n          // Update participant status to completed\n          await this.prisma.client.participant.update({\n            where: { id: participantId },\n            data: { status: 'completed' },\n          });\n          // Create alumni record\n          const measureName = (participant as any).measure?.name ?? '';\n          const existing = await this.prisma.client.alumni.findFirst({\n            where: { tenantId, name: participant.name, measure: measureName },\n          });\n          if (!existing) {\n            await this.prisma.client.alumni.create({\n              data: {\n                name: participant.name,\n                measure: measureName,\n                outcome: 'employed',\n                graduatedAt: new Date(),\n                tenantId,\n              },\n            });\n            console.log('[Quiz] auto-alumni created for:', participant.name);\n          }\n        }\n      } catch(e: any) { console.error('[Quiz] auto-alumni FAILED:', e.message); }\n    }"
);

fs.writeFileSync('src/quiz/quiz.service.ts', c, 'utf8');
console.log('DONE');

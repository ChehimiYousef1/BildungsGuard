const fs = require('fs');
let c = fs.readFileSync('src/quiz/quiz.service.ts', 'utf8');

// Replace include measure with separate fetch
c = c.replace(
  "const participant = await this.prisma.client.participant.findFirst({\n          where: { id: participantId, tenantId },\n          include: { measure: true },\n        });",
  "const participant = await this.prisma.client.participant.findFirst({\n          where: { id: participantId, tenantId },\n        });\n        // Fetch measure separately\n        const measure = participant?.measureId\n          ? await this.prisma.client.measure.findFirst({ where: { id: participant.measureId } })\n          : null;"
);

// Replace measureName reference
c = c.replace(
  "const measureName = (participant as any).measure?.name ?? '';",
  "const measureName = (measure as any)?.name ?? '';\n          console.log('[Alumni] measureName:', measureName);"
);

fs.writeFileSync('src/quiz/quiz.service.ts', c, 'utf8');
console.log('DONE');

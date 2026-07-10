const fs = require('fs');
let s = fs.readFileSync('src/documents/documents.service.ts', 'utf8');

c = s.replace(
  "    // Recalculate fileCompleteness\n    if (updated.participantId) {\n      const allDocs = await this.prisma.client.document.findMany({ where: { participantId: updated.participantId } });\n      const ready = allDocs.filter((d: any) => d.status === 'doc_ready').length;\n      const pct = allDocs.length > 0 ? Math.round((ready / allDocs.length) * 100) : 0;\n      await this.prisma.client.participant.update({ where: { id: updated.participantId }, data: { fileCompleteness: pct } });\n    }",
  "    // Recalculate fileCompleteness based on required docs\n    if (updated.participantId) {\n      const REQUIRED_DOCS = ['PARTICIPANT_CONTRACT', 'PRIVACY_CONSENT', 'MEDIA_CONSENT', 'CV', 'CERTIFICATE', 'SICK_NOTE'];\n      const allDocs = await this.prisma.client.document.findMany({ where: { participantId: updated.participantId } });\n      const readyTypes = new Set(allDocs.filter((d: any) => d.status === 'doc_ready' || d.status === 'doc_manual').map((d: any) => d.type));\n      const ready = REQUIRED_DOCS.filter(t => readyTypes.has(t)).length;\n      const pct = Math.round((ready / REQUIRED_DOCS.length) * 100);\n      await this.prisma.client.participant.update({ where: { id: updated.participantId }, data: { fileCompleteness: pct } });\n      console.log('[Completeness]', updated.participantId, '| ready:', ready, '/', REQUIRED_DOCS.length, '=', pct + '%');\n    }"
);

fs.writeFileSync('src/documents/documents.service.ts', c, 'utf8');
console.log('DONE');

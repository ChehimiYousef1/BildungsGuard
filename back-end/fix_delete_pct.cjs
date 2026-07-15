const fs = require('fs');
let s = fs.readFileSync('src/documents/documents.service.ts', 'utf8');

// Add completeness recalculation after remove
s = s.replace(
  "  async remove(tenantId: string, id: string) {\n    await this.findOne(tenantId, id);\n    return this.prisma.client.document.delete({ where: { id } });\n  }",
  "  async remove(tenantId: string, id: string) {\n    const doc = await this.findOne(tenantId, id);\n    await this.prisma.client.document.delete({ where: { id } });\n    // Recalculate after delete\n    if (doc.participantId) {\n      const REQUIRED_DOCS = ['PARTICIPANT_CONTRACT', 'PRIVACY_CONSENT', 'MEDIA_CONSENT', 'CV', 'CERTIFICATE', 'SICK_NOTE'];\n      const allDocs = await this.prisma.client.document.findMany({ where: { participantId: doc.participantId } });\n      const readyTypes = new Set(allDocs.filter((d) => d.status === 'doc_ready' || d.status === 'doc_manual').map((d) => d.type));\n      const ready = REQUIRED_DOCS.filter(t => readyTypes.has(t)).length;\n      const pct = Math.round((ready / REQUIRED_DOCS.length) * 100);\n      await this.prisma.client.participant.update({ where: { id: doc.participantId }, data: { fileCompleteness: pct } });\n    }\n    return { deleted: true };\n  }"
);

fs.writeFileSync('src/documents/documents.service.ts', s, 'utf8');
console.log('DONE');

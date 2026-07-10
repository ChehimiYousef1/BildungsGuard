const fs = require('fs');
let s = fs.readFileSync('src/documents/documents.service.ts', 'utf8');

// Add completeness calculation after file upload
c = s.replace(
  "    const fileRef = '/uploads/documents/' + id + '/' + filename;\n    return this.prisma.client.document.update({\n      where: { id },\n      data: { fileRef, status: 'doc_ready' },\n    });",
  "    const fileRef = '/uploads/documents/' + id + '/' + filename;\n    const updated = await this.prisma.client.document.update({\n      where: { id },\n      data: { fileRef, status: 'doc_ready' },\n    });\n    // Recalculate fileCompleteness\n    if (updated.participantId) {\n      const allDocs = await this.prisma.client.document.findMany({ where: { participantId: updated.participantId } });\n      const ready = allDocs.filter((d: any) => d.status === 'doc_ready').length;\n      const pct = allDocs.length > 0 ? Math.round((ready / allDocs.length) * 100) : 0;\n      await this.prisma.client.participant.update({ where: { id: updated.participantId }, data: { fileCompleteness: pct } });\n    }\n    return updated;"
);

fs.writeFileSync('src/documents/documents.service.ts', c, 'utf8');
console.log('DONE');

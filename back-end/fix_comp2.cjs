const fs = require('fs');
let s = fs.readFileSync('src/documents/documents.service.ts', 'utf8');

// Find uploadFile method and add completeness after it
const uploadEnd = s.indexOf('return this.prisma.client.document.update({\n      where: { id },\n      data: { fileRef, status');
if (uploadEnd > -1) {
  // Find the closing of this return statement
  const closeIdx = s.indexOf('\n    });', uploadEnd) + 7;
  
  const completenessCode = `
    // Recalculate fileCompleteness
    const freshDoc = await this.prisma.client.document.findFirst({ where: { id } });
    if (freshDoc?.participantId) {
      const allDocs = await this.prisma.client.document.findMany({ where: { participantId: freshDoc.participantId } });
      const ready = allDocs.filter((d: any) => d.status === 'doc_ready' || d.status === 'doc_manual').length;
      const pct = allDocs.length > 0 ? Math.round((ready / allDocs.length) * 100) : 0;
      await this.prisma.client.participant.updateMany({ where: { id: freshDoc.participantId }, data: { fileCompleteness: pct } });
      console.log('[Completeness] participant:', freshDoc.participantId, '| pct:', pct);
    }`;

  s = s.slice(0, closeIdx) + completenessCode + s.slice(closeIdx);
  console.log('Completeness code added at:', closeIdx);
} else {
  console.log('Upload method not found');
}

fs.writeFileSync('src/documents/documents.service.ts', s, 'utf8');
console.log('DONE');

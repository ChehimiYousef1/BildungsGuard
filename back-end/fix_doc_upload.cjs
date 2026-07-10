const fs = require('fs');
let s = fs.readFileSync('src/documents/documents.service.ts', 'utf8');

// Add fs and path imports if missing
if (!s.includes("import * as fsNode")) {
  s = s.replace(
    "import { Injectable",
    "import * as fsNode from 'fs';\nimport * as pathNode from 'path';\nimport { Injectable"
  );
}

// Replace uploadFile method
s = s.replace(
  `  async uploadFile(tenantId: string, id: string, file: { originalname: string; buffer: Buffer; mimetype: string }) {
    await this.findOne(tenantId, id);
    const safeName = file.originalname.replace(/[^\\w.\\-]/g, '_');
    const objectName = \`\${tenantId}/documents/\${id}/\${Date.now()}-\${safeName}\`;
    await this.storage.upload(objectName, file.buffer, file.mimetype);
    return this.prisma.client.document.update({
      where: { id },
      data: { fileRef: objectName, status: 'doc_ready' },
    });
  }`,
  `  async uploadFile(tenantId: string, id: string, file: { originalname: string; buffer: Buffer; mimetype: string }) {
    await this.findOne(tenantId, id);
    const safeName = file.originalname.replace(/[^\\w.\\-]/g, '_');
    const dir = pathNode.join(process.cwd(), 'uploads', 'documents', id);
    fsNode.mkdirSync(dir, { recursive: true });
    const filename = Date.now() + '-' + safeName;
    fsNode.writeFileSync(pathNode.join(dir, filename), file.buffer);
    const fileRef = '/uploads/documents/' + id + '/' + filename;
    return this.prisma.client.document.update({
      where: { id },
      data: { fileRef, status: 'doc_ready' },
    });
  }`
);

// Replace getFileUrl to serve local file
s = s.replace(
  `  async getFileUrl(tenantId: string, id: string) {
    const row = await this.findOne(tenantId, id);
    if (!row.fileRef) throw new NotFoundException('No file attached to this document');
    const url = await this.storage.presignedGet(row.fileRef, 3600);
    return { url };
  }`,
  `  async getFileUrl(tenantId: string, id: string) {
    const row = await this.findOne(tenantId, id);
    if (!row.fileRef) throw new NotFoundException('No file attached to this document');
    return { url: row.fileRef };
  }`
);

fs.writeFileSync('src/documents/documents.service.ts', s, 'utf8');
console.log('DONE');

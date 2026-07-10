const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.controller.ts', 'utf8');

c = c.replace(
  "  async uploadCv(@Param('id') id: string, @UploadedFile() file: any) {\n    if (!file) return { error: 'No file uploaded' };",
  "  async uploadCv(@Param('id') id: string, @UploadedFile() file: any) {\n    console.log('[CV Upload] id:', id, '| file:', file?.originalname ?? 'NO FILE');\n    if (!file) return { error: 'No file uploaded' };"
);

fs.writeFileSync('src/trainers/trainers.controller.ts', c, 'utf8');
console.log('DONE');

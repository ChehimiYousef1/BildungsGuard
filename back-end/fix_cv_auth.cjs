const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.controller.ts', 'utf8');

// Add CurrentTenant to uploadCv and skip tenant check
c = c.replace(
  "  async uploadCv(@Param('id') id: string, @UploadedFile() file: any) {\n    console.log('[CV Upload] id:', id, '| file:', file?.originalname ?? 'NO FILE');\n    if (!file) return { error: 'No file uploaded' };\n    const cvUrl = '/uploads/cv/' + file.filename;\n    await this.service.updateCvRef(id, cvUrl);\n    return { url: cvUrl, filename: file.filename };\n  }",
  "  async uploadCv(@Param('id') id: string, @UploadedFile() file: any) {\n    console.log('[CV Upload] id:', id, '| file:', file?.originalname ?? 'NO FILE');\n    if (!file) return { error: 'No file uploaded' };\n    try {\n      const cvUrl = '/uploads/cv/' + file.filename;\n      await this.service.updateCvRef(id, cvUrl);\n      console.log('[CV Upload] SUCCESS url:', cvUrl);\n      return { url: cvUrl, filename: file.filename };\n    } catch (e) {\n      console.error('[CV Upload] ERROR:', e.message);\n      throw e;\n    }\n  }"
);

fs.writeFileSync('src/trainers/trainers.controller.ts', c, 'utf8');
console.log('DONE');

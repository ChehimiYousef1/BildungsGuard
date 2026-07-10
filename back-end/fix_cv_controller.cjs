const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.controller.ts', 'utf8');

// Replace the entire uploadCv endpoint
const oldEndpoint = c.match(/@Post\(':id\/cv'\)[\s\S]*?}\s*\n\s*\}/)?.[0];
if (oldEndpoint) {
  const newEndpoint = `@Post(':id/cv')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req: any, _file: any, cb: any) => {
        const dir = require('path').join(process.cwd(), 'uploads', 'cv');
        require('fs').mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req: any, file: any, cb: any) => {
        const ext = require('path').extname(file.originalname);
        cb(null, 'cv-' + req.params.id + '-' + Date.now() + ext);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadCv(@Param('id') id: string, @UploadedFile() file: any) {
    if (!file) return { error: 'No file uploaded' };
    const cvUrl = '/uploads/cv/' + file.filename;
    await this.service.updateCvRef(id, cvUrl);
    return { url: cvUrl, filename: file.filename };
  }
}`;
  c = c.replace(oldEndpoint, newEndpoint);
  console.log('Replaced OK');
} else {
  console.log('Pattern not found');
}

fs.writeFileSync('src/trainers/trainers.controller.ts', c, 'utf8');
console.log('DONE');

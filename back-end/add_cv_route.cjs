const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.controller.ts', 'utf8');

// Add imports
c = c.replace(
  "import { Body, Controller, Post, Delete, Get, Param, Patch } from '@nestjs/common';",
  "import { Body, Controller, Post, Delete, Get, Param, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';\nimport { FileInterceptor } from '@nestjs/platform-express';\nimport { diskStorage } from 'multer';\nimport * as path from 'path';\nimport * as fs from 'fs';"
);

// Add CV upload endpoint before closing }
const lastClose = c.lastIndexOf('}');
const cvEndpoint = `
  @Post(':id/cv')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = './uploads/cv';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, 'cv-' + req.params.id + '-' + Date.now() + ext);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadCv(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) return { error: 'No file' };
    const cvUrl = '/uploads/cv/' + file.filename;
    await this.service.updateCvRef(id, cvUrl);
    return { url: cvUrl };
  }
`;

c = c.slice(0, lastClose) + cvEndpoint + '}';
fs.writeFileSync('src/trainers/trainers.controller.ts', c, 'utf8');
console.log('DONE controller');

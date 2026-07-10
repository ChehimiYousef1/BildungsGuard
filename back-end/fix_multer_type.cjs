const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.controller.ts', 'utf8');
c = c.replace('@UploadedFile() file: Express.Multer.File', '@UploadedFile() file: any');
fs.writeFileSync('src/trainers/trainers.controller.ts', c, 'utf8');
console.log('DONE');

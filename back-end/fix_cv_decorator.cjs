const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.controller.ts', 'utf8');

c = c.replace(
  "  @UseInterceptors(FileInterceptor('file', {",
  "  @Post(':id/cv')\n  @UseInterceptors(FileInterceptor('file', {"
);

fs.writeFileSync('src/trainers/trainers.controller.ts', c, 'utf8');
console.log('DONE');
console.log('Has Post id/cv:', c.includes("@Post(':id/cv')"));

const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.controller.ts', 'utf8');

// Remove duplicate @Post decorators
c = c.replace(
  "  @Post(':id/cv')\n  @Post(':id/cv')\n  @Post(':id/cv')\n  @UseInterceptors",
  "  @Post(':id/cv')\n  @UseInterceptors"
);

fs.writeFileSync('src/trainers/trainers.controller.ts', c, 'utf8');
const count = (c.match(/@Post\(':id\/cv'\)/g) || []).length;
console.log('@Post id/cv count:', count);
console.log('DONE');

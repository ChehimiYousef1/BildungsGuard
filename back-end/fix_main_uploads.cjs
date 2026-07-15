const fs = require('fs');
let c = fs.readFileSync('src/main.ts', 'utf8');

// Remove duplicate uploads static blocks - keep only first one
const firstIdx = c.indexOf('// ===== Static uploads =====');
const secondIdx = c.indexOf('// ===== Static files for uploads (CV etc) =====');

if (secondIdx > -1) {
  const endOfSecond = c.indexOf('\n  app.useStaticAssets(uploadsDir', secondIdx) ;
  const endLine = c.indexOf('\n', endOfSecond + 50) + 1;
  const thirdLine = c.indexOf('\n', endLine) + 1;
  c = c.slice(0, secondIdx) + c.slice(thirdLine);
  console.log('Removed duplicate');
}

fs.writeFileSync('src/main.ts', c, 'utf8');
const count = (c.match(/uploadsDir/g) || []).length;
console.log('uploadsDir count:', count);
console.log('DONE');

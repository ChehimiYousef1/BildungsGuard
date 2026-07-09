const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Fix all pt.translateText(measure patterns
c = c.replace(/pt\.translateText\(measure\?\.name \?\? "", lang\)/g, 'translateText(pt?.measure?.name ?? pt?.m ?? "", lang)');
c = c.replace(/pt\.translateText\(measure\.name, lang\)/g, 'translateText(pt?.measure?.name ?? pt?.m ?? "", lang)');
c = c.replace(/\{pt\.translateText\(measure\?\.name \?\? "", lang\) &&/g, '{translateText(pt?.measure?.name ?? pt?.m ?? "", lang) &&');

console.log('Fixed');
fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');

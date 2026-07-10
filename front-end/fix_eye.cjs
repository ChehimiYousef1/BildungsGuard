const fs = require('fs');
let c = fs.readFileSync('src/features/trainers/Trainers.tsx', 'utf8');

// Replace emoji with Eye/EyeOff icons
c = c.replace(
  "{showPass ? '??' : '??'}",
  "{showPass ? <EyeOff size={14} /> : <Eye size={14} />}"
);

fs.writeFileSync('src/features/trainers/Trainers.tsx', c, 'utf8');
console.log('DONE');

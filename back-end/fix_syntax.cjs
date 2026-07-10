const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.service.ts', 'utf8');

c = c.replace(
  "    return trainer;\n  });\n  }",
  "    return trainer;\n  }"
);

fs.writeFileSync('src/trainers/trainers.service.ts', c, 'utf8');
console.log('DONE');

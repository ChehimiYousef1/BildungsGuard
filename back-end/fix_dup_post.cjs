const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.controller.ts', 'utf8');

// Fix duplicate Post
c = c.replace(
  "import { Body, Controller, Post, Delete, Get, Param, Patch, Post }",
  "import { Body, Controller, Post, Delete, Get, Param, Patch }"
);

fs.writeFileSync('src/trainers/trainers.controller.ts', c, 'utf8');
console.log('DONE');

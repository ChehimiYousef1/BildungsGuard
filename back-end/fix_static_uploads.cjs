const fs = require('fs');
let c = fs.readFileSync('src/main.ts', 'utf8');

c = c.replace(
  "  app.use(json({ limit: '500mb' }));",
  "  app.use(json({ limit: '500mb' }));\n  // ===== Static uploads =====\n  const uploadsDir = path.join(process.cwd(), 'uploads');\n  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });\n  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });"
);

fs.writeFileSync('src/main.ts', c, 'utf8');
console.log('DONE');
console.log('Has uploads static:', c.includes("prefix: '/uploads'"));

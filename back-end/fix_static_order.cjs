const fs = require('fs');
let c = fs.readFileSync('src/main.ts', 'utf8');

// Move uploads static BEFORE setGlobalPrefix
c = c.replace(
  "  app.setGlobalPrefix('api/v1');\n  app.enableCors",
  "  // ===== Static files =====\n  const uploadsPath = require('path').join(process.cwd(), 'uploads');\n  if (!require('fs').existsSync(uploadsPath)) require('fs').mkdirSync(uploadsPath, { recursive: true });\n  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });\n\n  app.setGlobalPrefix('api/v1');\n  app.enableCors"
);

// Remove old uploads static
c = c.replace(
  "  // ===== Static uploads =====\n  const uploadsDir = require('path').join(process.cwd(), 'uploads');\n  if (!require('fs').existsSync(uploadsDir)) require('fs').mkdirSync(uploadsDir, { recursive: true });\n  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });\n",
  ""
);
c = c.replace(
  "  // ===== Static uploads =====\n  const uploadsDir = path.join(process.cwd(), 'uploads');\n  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });\n  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });\n",
  ""
);

fs.writeFileSync('src/main.ts', c, 'utf8');
console.log('DONE');
console.log(c);

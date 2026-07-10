const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.service.ts', 'utf8');

c = c.replace(
  "  create(tenantId: string, dto: CreateTrainersDto) {\n    return this.prisma.client.trainer.create({ data: { ...dto, tenantId } });\n  }",
  "  async create(tenantId: string, dto: CreateTrainersDto) {\n    const { email, password, ...rest } = dto as any;\n    const trainer = await this.prisma.client.trainer.create({ data: { ...rest, tenantId } });\n    if (email && password) {\n      try {\n        await this.mail.send(email, 'Ihre Zugangsdaten / Your login credentials',\n          '<div style=\"font-family:sans-serif;padding:24px\"><h2 style=\"color:#6D5DF6\">Willkommen / Welcome, ' + (rest.name || 'Trainer') + '!</h2>' +\n          '<div style=\"background:#f8f8f8;border-radius:8px;padding:16px;margin:16px 0\">' +\n          '<p><strong>E-Mail:</strong> ' + email + '</p>' +\n          '<p><strong>Passwort:</strong> ' + password + '</p></div>' +\n          '<p>Portal: <a href=\"http://localhost:5173\">http://localhost:5173</a></p></div>'\n        );\n      } catch (e) { console.error('Welcome email failed:', e); }\n    }\n    return trainer;\n  }"
);

fs.writeFileSync('src/trainers/trainers.service.ts', c, 'utf8');

// Verify
const updated = fs.readFileSync('src/trainers/trainers.service.ts', 'utf8');
console.log('async create:', updated.includes('async create'));
console.log('mail.send:', updated.includes('mail.send'));
console.log('DONE');

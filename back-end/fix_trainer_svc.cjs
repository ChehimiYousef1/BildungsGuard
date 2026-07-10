const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.service.ts', 'utf8');

// Make create async and add email sending
c = c.replace(
  "  create(tenantId: string, dto: CreateTrainersDto) {\n    return this.prisma.client.trainer.create({ data: { ...dto, tenantId } });\n  }",
  "  async create(tenantId: string, dto: CreateTrainersDto & { email?: string; password?: string }) {\n    const { email, password, ...rest } = dto as any;\n    const trainer = await this.prisma.client.trainer.create({ data: { ...rest, tenantId } });\n    if (email && password) {\n      try {\n        await this.mail.send(\n          email,\n          'Ihre Zugangsdaten / Your login credentials',\n          '<div style=\"font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px\">' +\n          '<h2 style=\"color:#6D5DF6\">Willkommen / Welcome, ' + (rest.name || 'Trainer') + '!</h2>' +\n          '<p>Hier sind Ihre Zugangsdaten fur das Trainer-Portal:</p>' +\n          '<div style=\"background:#f8f8f8;border-radius:8px;padding:16px;margin:16px 0\">' +\n          '<p><strong>E-Mail:</strong> ' + email + '</p>' +\n          '<p><strong>Passwort / Password:</strong> ' + password + '</p>' +\n          '</div>' +\n          '<p>Portal: <a href=\"http://localhost:5173\">http://localhost:5173</a></p>' +\n          '</div>'\n        );\n      } catch (e) { console.error('Welcome email failed:', e); }\n    }\n    return trainer;\n  }"
);

fs.writeFileSync('src/trainers/trainers.service.ts', c, 'utf8');
console.log('DONE');

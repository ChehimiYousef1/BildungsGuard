const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.service.ts', 'utf8');

// Find and replace create method regardless of whitespace
const oldMethod = c.match(/create\(tenantId[^}]+\}\s*\}/)?.[0];
if (oldMethod) {
  const newMethod = `async create(tenantId: string, dto: CreateTrainersDto) {
    const { email, password, ...rest } = dto as any;
    const trainer = await this.prisma.client.trainer.create({ data: { ...rest, tenantId } });
    if (email && password) {
      try {
        await this.mail.send(email, 'Ihre Zugangsdaten / Your login credentials',
          '<div style="font-family:sans-serif;padding:24px"><h2 style="color:#6D5DF6">Willkommen, ' + (rest.name || 'Trainer') + '!</h2>' +
          '<p><strong>E-Mail:</strong> ' + email + '</p>' +
          '<p><strong>Passwort:</strong> ' + password + '</p>' +
          '<p><a href="http://localhost:5173">Portal Login</a></p></div>'
        );
      } catch (e) { console.error('Email failed:', e); }
    }
    return trainer;
  }`;
  c = c.replace(oldMethod, newMethod);
  console.log('Replaced OK');
} else {
  console.log('Method not found - showing around create:');
  const idx = c.indexOf('create(tenantId');
  console.log(c.slice(idx, idx + 150));
}

fs.writeFileSync('src/trainers/trainers.service.ts', c, 'utf8');
console.log('async create:', c.includes('async create'));

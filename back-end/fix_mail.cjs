const fs = require('fs');
let c = fs.readFileSync('src/participants/participants.service.ts', 'utf8');

// Add MailService import
c = c.replace(
  "import { Injectable, NotFoundException } from '@nestjs/common';",
  "import { Injectable, NotFoundException } from '@nestjs/common';\nimport { MailService } from '../mail/mail.service';"
);

// Add MailService to constructor
c = c.replace(
  "constructor(private readonly prisma: PrismaService) {}",
  "constructor(\n    private readonly prisma: PrismaService,\n    private readonly mail: MailService,\n  ) {}"
);

// Add welcome email after user creation
c = c.replace(
  "    return participant;",
`    // Send welcome email with credentials
    if (email && password && dto.sendWelcomeEmail !== false) {
      const name = rest.name || 'Teilnehmer';
      try {
        await this.mail.send(
          email,
          'Ihre Zugangsdaten / Your login credentials',
          \`<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
            <h2 style="color:#6D5DF6">Willkommen / Welcome, \${name}!</h2>
            <p>Hier sind Ihre Zugangsdaten für das Teilnehmerportal:</p>
            <p>Here are your login credentials for the participant portal:</p>
            <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:16px 0">
              <p><strong>E-Mail:</strong> \${email}</p>
              <p><strong>Passwort / Password:</strong> \${password}</p>
            </div>
            <p>Portal: <a href="http://localhost:5173">http://localhost:5173</a></p>
            <p style="color:#888;font-size:12px">Bitte ändern Sie Ihr Passwort nach der ersten Anmeldung.<br>Please change your password after first login.</p>
          </div>\`
        );
      } catch (e) {
        console.error('Welcome email failed:', e);
      }
    }
    return participant;`
);

fs.writeFileSync('src/participants/participants.service.ts', c, 'utf8');
console.log('DONE');

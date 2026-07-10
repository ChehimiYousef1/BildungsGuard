const fs = require('fs');

// 1. Fix trainers controller - add welcome email endpoint
let c = fs.readFileSync('src/trainers/trainers.controller.ts', 'utf8');
if (!c.includes('welcome-email')) {
  c = c.replace(
    "import { Body, Controller",
    "import { Body, Controller"
  );
  // Add endpoint before last }
  const lastClose = c.lastIndexOf('}');
  const newEndpoint = `
  @Post('welcome-email')
  async sendWelcomeEmail(@Body() body: { email: string; name: string; password: string }) {
    try {
      await this.service.sendWelcomeEmail(body.email, body.name, body.password);
      return { sent: true };
    } catch (e) {
      return { sent: false, error: String(e) };
    }
  }
`;
  c = c.slice(0, lastClose) + newEndpoint + '}';
  
  // Add Post to imports if not there
  if (!c.includes("Post,")) {
    c = c.replace("import { Body, Controller,", "import { Body, Controller, Post,");
  }
  fs.writeFileSync('src/trainers/trainers.controller.ts', c, 'utf8');
  console.log('Controller updated');
}

// 2. Fix trainers service - add sendWelcomeEmail method
let s = fs.readFileSync('src/trainers/trainers.service.ts', 'utf8');
if (!s.includes('sendWelcomeEmail')) {
  // Add MailService import
  if (!s.includes('MailService')) {
    s = s.replace(
      "import { Injectable",
      "import { Injectable"
    );
    s = s.replace(
      "import { PrismaService }",
      "import { MailService } from '../mail/mail.service';\nimport { PrismaService }"
    );
  }
  // Add MailService to constructor
  s = s.replace(
    "constructor(private readonly prisma: PrismaService)",
    "constructor(\n    private readonly prisma: PrismaService,\n    private readonly mail: MailService,\n  )"
  );
  // Add method before last }
  const lastClose = s.lastIndexOf('}');
  const method = `
  async sendWelcomeEmail(email: string, name: string, password: string) {
    return this.mail.send(
      email,
      'Ihre Zugangsdaten / Your login credentials',
      '<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">' +
      '<h2 style="color:#6D5DF6">Willkommen / Welcome, ' + name + '!</h2>' +
      '<p>Hier sind Ihre Zugangsdaten fur das Trainer-Portal:</p>' +
      '<p>Here are your login credentials for the trainer portal:</p>' +
      '<div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:16px 0">' +
      '<p><strong>E-Mail:</strong> ' + email + '</p>' +
      '<p><strong>Passwort / Password:</strong> ' + password + '</p>' +
      '</div>' +
      '<p>Portal: <a href="http://localhost:5173">http://localhost:5173</a></p>' +
      '<p style="color:#888;font-size:12px">Bitte andern Sie Ihr Passwort nach der ersten Anmeldung.</p>' +
      '</div>'
    );
  }
`;
  s = s.slice(0, lastClose) + method + '}';
  fs.writeFileSync('src/trainers/trainers.service.ts', s, 'utf8');
  console.log('Service updated');
}
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/mail/mail.service.ts', 'utf8');

c = c.replace(
  "      this.transporter = nodemailer.createTransport({\n        host,\n        port: this.config.get<number>('smtp.port') ?? 587,\n        secure: false,\n        requireTLS: true,\n        auth: { user: this.config.get<string>('smtp.user'), pass: this.config.get<string>('smtp.pass') },\n        tls: { rejectUnauthorized: false },\n      });\n      this.logger.log('SMTP transporter created for ' + host);",
  "      this.transporter = nodemailer.createTransport({\n        host,\n        port: this.config.get<number>('smtp.port') ?? 587,\n        secure: false,\n        requireTLS: true,\n        auth: { user: this.config.get<string>('smtp.user'), pass: this.config.get<string>('smtp.pass') },\n        tls: { rejectUnauthorized: false },\n      });\n      this.logger.log('SMTP transporter ready: ' + this.config.get('smtp.user'));"
);

fs.writeFileSync('src/mail/mail.service.ts', c, 'utf8');
console.log('DONE');

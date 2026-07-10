const fs = require('fs');
let c = fs.readFileSync('src/mail/mail.service.ts', 'utf8');

// Use direct env vars instead of config service
c = c.replace(
  "  constructor(private readonly config: ConfigService) {\n    const host = this.config.get<string>('smtp.host');\n    this.logger.log('SMTP host from config: ' + host);\n    if (host) {\n      this.transporter = nodemailer.createTransport({\n        host,\n        port: this.config.get<number>('smtp.port') ?? 587,\n        secure: false,\n        requireTLS: true,\n        auth: { user: this.config.get<string>('smtp.user'), pass: this.config.get<string>('smtp.pass') },\n        tls: { rejectUnauthorized: false },\n      });\n      this.logger.log('SMTP transporter ready: ' + this.config.get('smtp.user'));\n    }\n  }",
  "  constructor(private readonly config: ConfigService) {\n    const host = process.env.SMTP_HOST || this.config.get<string>('smtp.host');\n    const user = process.env.SMTP_USER || this.config.get<string>('smtp.user');\n    const pass = process.env.SMTP_PASS || this.config.get<string>('smtp.pass');\n    this.logger.log('SMTP host: ' + host + ' | user: ' + user);\n    if (host && user && pass) {\n      this.transporter = nodemailer.createTransport({\n        host,\n        port: parseInt(process.env.SMTP_PORT || '587'),\n        secure: false,\n        requireTLS: true,\n        auth: { user, pass },\n        tls: { rejectUnauthorized: false },\n      });\n      this.logger.log('SMTP transporter ready: ' + user);\n    } else {\n      this.logger.warn('SMTP not configured: host=' + host + ' user=' + user);\n    }\n  }"
);

// Also update send method to use process.env for from
c = c.replace(
  "    const from = this.config.get<string>('smtp.from');",
  "    const from = process.env.SMTP_FROM || this.config.get<string>('smtp.from');"
);

fs.writeFileSync('src/mail/mail.service.ts', c, 'utf8');
console.log('DONE');

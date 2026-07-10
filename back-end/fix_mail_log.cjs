const fs = require('fs');
let c = fs.readFileSync('src/mail/mail.service.ts', 'utf8');

c = c.replace(
  "    const host = this.config.get<string>('smtp.host');\n    if (host) {",
  "    const host = this.config.get<string>('smtp.host');\n    this.logger.log('SMTP host from config: ' + host);\n    if (host) {"
);

fs.writeFileSync('src/mail/mail.service.ts', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/trainers/trainers.service.ts', 'utf8');

// Add nodemailer import
c = c.replace(
  "import { Injectable, NotFoundException } from '@nestjs/common';",
  "import { Injectable, NotFoundException } from '@nestjs/common';\nimport * as nodemailer from 'nodemailer';"
);

// Replace mail.send with direct nodemailer call
c = c.replace(
  "        await this.mail.send(email, 'Ihre Zugangsdaten / Your login credentials',\n          '<div style=\"font-family:sans-serif;padding:24px\"><h2 style=\"color:#6D5DF6\">Willkommen, ' + (rest.name || 'Trainer') + '!</h2>' +\n          '<p><strong>E-Mail:</strong> ' + email + '</p>' +\n          '<p><strong>Passwort:</strong> ' + password + '</p>' +\n          '<p><a href=\"http://localhost:5173\">Portal Login</a></p></div>'\n        );",
  "        const transporter = nodemailer.createTransport({\n          host: process.env.SMTP_HOST,\n          port: 587,\n          secure: false,\n          requireTLS: true,\n          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },\n          tls: { rejectUnauthorized: false },\n        });\n        await transporter.sendMail({\n          from: process.env.SMTP_FROM,\n          to: email,\n          subject: 'Ihre Zugangsdaten / Your login credentials',\n          html: '<div style=\"font-family:sans-serif;padding:24px\"><h2 style=\"color:#6D5DF6\">Willkommen, ' + (rest.name || 'Trainer') + '!</h2><p><strong>E-Mail:</strong> ' + email + '</p><p><strong>Passwort:</strong> ' + password + '</p><p><a href=\"http://localhost:5173\">Portal Login</a></p></div>',\n        });\n        console.log('[Trainer] Email sent to:', email);"
);

fs.writeFileSync('src/trainers/trainers.service.ts', c, 'utf8');
console.log('DONE');

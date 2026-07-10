require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  requireTLS: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false }
});
transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: process.env.SMTP_USER,
  subject: 'Test All-in-One',
  html: '<p>Test email works!</p>'
}).then(r => console.log('SENT OK:', r.messageId))
  .catch(e => console.error('FAILED:', e.message));

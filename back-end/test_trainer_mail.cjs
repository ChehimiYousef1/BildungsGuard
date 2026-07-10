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
  to: 'bakeertarraf@gmail.com',
  subject: 'Test Trainer Credentials',
  html: '<p>Email: trainer@test.com</p><p>Password: Test1234!</p>'
}).then(r => console.log('SENT:', r.messageId))
  .catch(e => console.error('FAILED:', e.message));

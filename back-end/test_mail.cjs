const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: { user: 'bakeertarraf@gmail.com', pass: 'tjmcnaweriltties' }
});
transporter.sendMail({
  from: 'bakeertarraf@gmail.com',
  to: 'bakeertarraf@gmail.com',
  subject: 'Test Email',
  html: '<p>Test from All-in-One</p>'
}).then(r => console.log('SENT:', r.messageId)).catch(e => console.error('FAILED:', e.message));

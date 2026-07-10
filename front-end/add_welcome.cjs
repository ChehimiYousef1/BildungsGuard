const fs = require('fs');
let c = fs.readFileSync('src/features/trainers/Trainers.tsx', 'utf8');

c = c.replace(
  "      if (cvFile && trainer?.id) await uploadCv(trainer.id, cvFile);",
  "      if (cvFile && trainer?.id) await uploadCv(trainer.id, cvFile);\n      try { await api('/trainers/welcome-email', { method: 'POST', body: JSON.stringify({ email: form.email.trim(), name: form.name.trim(), password: form.password }) }); } catch(e) { console.warn('email failed', e); }"
);

fs.writeFileSync('src/features/trainers/Trainers.tsx', c, 'utf8');

const check = c.includes('welcome-email');
console.log('welcome-email added:', check);

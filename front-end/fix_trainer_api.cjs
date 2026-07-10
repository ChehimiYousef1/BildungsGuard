const fs = require('fs');
let c = fs.readFileSync('src/features/trainers/Trainers.tsx', 'utf8');

c = c.replace(
  "      // Send welcome email\n      try {\n        await fetch('/api/v1/trainers/welcome-email', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json', ...(window.__authToken ? { Authorization: 'Bearer ' + window.__authToken } : {}) },\n          body: JSON.stringify({ email: form.email.trim(), name: form.name.trim(), password: form.password }),\n        });\n      } catch (e) { console.warn('Welcome email failed', e); }",
  "      // Send welcome email\n      try {\n        await api('/trainers/welcome-email', {\n          method: 'POST',\n          body: JSON.stringify({ email: form.email.trim(), name: form.name.trim(), password: form.password }),\n        });\n      } catch (e) { console.warn('Welcome email failed', e); }"
);

fs.writeFileSync('src/features/trainers/Trainers.tsx', c, 'utf8');
console.log('DONE');

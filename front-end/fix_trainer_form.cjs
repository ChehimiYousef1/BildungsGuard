const fs = require('fs');
let c = fs.readFileSync('src/features/trainers/Trainers.tsx', 'utf8');

// 1. Add RefreshCw to imports
c = c.replace(
  "  Plus, AlertTriangle, ShieldCheck, X, Pencil, Trash2,\n  Upload, FileCheck2, Eye, Mail, Phone, Award, BookOpen,\n  CheckCircle2, Clock, User, BadgeCheck, Calendar, Download",
  "  Plus, AlertTriangle, ShieldCheck, X, Pencil, Trash2,\n  Upload, FileCheck2, Eye, Mail, Phone, Award, BookOpen,\n  CheckCircle2, Clock, User, BadgeCheck, Calendar, Download, RefreshCw"
);

// 2. Add genPassword function and showPass state after form state
c = c.replace(
  "  const [form,    setForm]    = useState({ name: '', email: '', password: '', qualificationArea: '' });",
  "  const [form,    setForm]    = useState({ name: '', email: '', password: '', qualificationArea: '' });\n  const [showPass, setShowPass] = useState(false);\n  const genPassword = () => {\n    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';\n    const pwd = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');\n    setForm((f) => ({ ...f, password: pwd }));\n    setShowPass(true);\n  };"
);

// 3. Add sendWelcomeEmail after trainer created
c = c.replace(
  "      if (cvFile && trainer?.id) await uploadCv(trainer.id, cvFile);",
  "      if (cvFile && trainer?.id) await uploadCv(trainer.id, cvFile);\n      // Send welcome email\n      try {\n        await fetch('/api/v1/trainers/welcome-email', {\n          method: 'POST',\n          headers: { 'Content-Type': 'application/json', ...(window.__authToken ? { Authorization: 'Bearer ' + window.__authToken } : {}) },\n          body: JSON.stringify({ email: form.email.trim(), name: form.name.trim(), password: form.password }),\n        });\n      } catch (e) { console.warn('Welcome email failed', e); }"
);

// 4. Replace password field with auto-generate version
c = c.replace(
  "              <label style={lbl}>{de ? 'Passwort *' : 'Password *'}\n                <input value={form.password} onChange={(e) => set('password', e.target.value)}\n                  style={inp} placeholder={de ? 'Min. 6 Zeichen' : 'Min. 6 characters'} type=\"password\" />\n              </label>",
  "              <label style={lbl}>{de ? 'Passwort *' : 'Password *'}\n                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>\n                  <input value={form.password} onChange={(e) => set('password', e.target.value)}\n                    style={{ ...inp, flex: 1, fontFamily: showPass ? 'monospace' : undefined }}\n                    placeholder={de ? 'Min. 6 Zeichen' : 'Min. 6 characters'}\n                    type={showPass ? 'text' : 'password'} />\n                  <button type=\"button\" onClick={() => setShowPass(v => !v)}\n                    style={{ background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}>\n                    {showPass ? '??' : '??'}\n                  </button>\n                  <button type=\"button\" onClick={genPassword}\n                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#6D5DF610', border: '1px solid #6D5DF6', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: '#6D5DF6', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>\n                    <RefreshCw size={12} /> {de ? 'Generieren' : 'Generate'}\n                  </button>\n                </div>\n                {form.password && <div style={{ fontSize: 11, color: '#0FB6A0', marginTop: 4 }}>? {de ? 'Passwort wird per E-Mail gesendet' : 'Password will be sent by email'}</div>}\n              </label>"
);

fs.writeFileSync('src/features/trainers/Trainers.tsx', c, 'utf8');
console.log('DONE');

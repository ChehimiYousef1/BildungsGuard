const fs = require('fs');
let c = fs.readFileSync('src/features/trainers/Trainers.tsx', 'utf8');

// Auto-generate password when form opens
c = c.replace(
  "  const [open,    setOpen]    = useState(false);",
  "  const [open,    setOpen]    = useState(false);\n  const openAddForm = () => {\n    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';\n    const pwd = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');\n    setForm({ name: '', email: '', password: pwd, qualificationArea: '' });\n    setShowPass(false);\n    setCvFile(null);\n    setFormErr(null);\n    setOpen(true);\n  };"
);

// Replace the + Add button to use openAddForm
c = c.replace(
  "onClick={() => setOpen(true)}",
  "onClick={openAddForm}"
);

fs.writeFileSync('src/features/trainers/Trainers.tsx', c, 'utf8');
console.log('DONE');

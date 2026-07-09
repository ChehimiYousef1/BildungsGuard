const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

// Remove the orphan closing brace after the comment
c = c.replace('{/* ===== INTEGRATION RATE BAR ===== */}\n       }', '{/* ===== INTEGRATION RATE BAR ===== */}');
c = c.replace('{/* ===== INTEGRATION RATE BAR ===== */}\n      }', '{/* ===== INTEGRATION RATE BAR ===== */}');
c = c.replace('{/* ===== INTEGRATION RATE BAR ===== */}\n        }', '{/* ===== INTEGRATION RATE BAR ===== */}');

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');

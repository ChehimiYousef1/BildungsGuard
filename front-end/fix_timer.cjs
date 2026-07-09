const fs = require('fs');
let c = fs.readFileSync('src/features/attendance/AttendanceGrid.tsx', 'utf8');

// Remove timer state lines
c = c.replace(/\s*const \[elapsed.*?\n/g, '');
c = c.replace(/\s*const \[reminderShown.*?\n/g, '');
c = c.replace(/\s*const timerRef.*?\n/g, '');
c = c.replace(/\s*const remaining.*?\n/g, '');
c = c.replace(/\s*const isReady.*?\n/g, '');
c = c.replace(/\s*const mm.*?\n/g, '');
c = c.replace(/\s*const ss.*?\n/g, '');

// Remove timer useEffect
c = c.replace(/\s*timerRef\.current = setInterval[\s\S]*?}\s*\}\s*\}\s*,\s*\[\]\s*\);/g, '');

// Remove WAIT_SECONDS usage
c = c.replace(/const WAIT_SECONDS[^\n]*\n/g, '');

fs.writeFileSync('src/features/attendance/AttendanceGrid.tsx', c, 'utf8');
console.log('DONE');

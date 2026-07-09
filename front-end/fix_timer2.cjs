const fs = require('fs');
let c = fs.readFileSync('src/features/attendance/AttendanceGrid.tsx', 'utf8');

// Remove the entire timer comment + useEffect block
c = c.replace(/  \/\/ ===== TIMER =====\n  useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);\n/g, '');

// Remove reminder useEffect
c = c.replace(/  \/\/ Reminder[^\n]*\n  useEffect\(\(\) => \{[\s\S]*?\}, \[isReady, reminderShown\]\);\n/g, '');

// Remove notification useEffect
c = c.replace(/  \/\/ ???[^\n]*\n  useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);\n/g, '');

// Remove any remaining isReady references in JSX
c = c.replace(/.*isReady.*\n/g, '');
c = c.replace(/.*reminderShown.*\n/g, '');
c = c.replace(/.*timerRef.*\n/g, '');
c = c.replace(/.*setElapsed.*\n/g, '');
c = c.replace(/.*mm.*ss.*\n/g, '');

fs.writeFileSync('src/features/attendance/AttendanceGrid.tsx', c, 'utf8');
console.log('DONE');

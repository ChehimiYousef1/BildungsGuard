const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

const marker = "label={lang === 'de' ? 'Eingliederungsquote' : 'Integration rate'} tone={integrationRate !== null && integrationRate >= 70 ? C.mint : C.amber} />";
const insert = "\n          <Stat icon={<CalendarClock size={18} />} num={stats && stats.days != null ? stats.days + ' ' + (lang === 'de' ? 'T' : 'd') : '…'} label={t('to_audit')} tone={C.blue} />";

if (c.includes(marker)) {
  c = c.replace(marker, marker + insert);
  console.log('CalendarClock stat added OK');
} else {
  console.log('marker not found');
}

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');

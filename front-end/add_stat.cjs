const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

const newStat = `
          <Stat
            icon={<TrendingUp size={18} />}
            num={integrationRate !== null ? \`\${integrationRate}%\` : '—'}
            label={lang === 'de' ? 'Eingliederungsquote' : 'Integration rate'}
            tone={integrationRate !== null && integrationRate >= 70 ? C.mint : C.amber}
          />`;

// Add before closing of stats div
const marker = '<Stat icon={<CalendarClock size={18}';
const idx = c.indexOf(marker);
if (idx > -1) {
  const end = c.indexOf('/>', idx) + 2;
  c = c.slice(0, end) + newStat + c.slice(end);
  console.log('Integration rate stat added back');
} else {
  console.log('CalendarClock stat not found');
}

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');

const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

// Find where to insert - after the last existing Stat component
const marker = '<Stat icon={<CalendarClock';
const idx = c.indexOf(marker);
if (idx > -1) {
  const end = c.indexOf('/>', idx) + 2;
  const newStat = `
          <Stat
            icon={<TrendingUp size={18} />}
            num={integrationRate !== null ? integrationRate + '%' : '\u2014'}
            label={lang === 'de' ? 'Eingliederungsquote' : 'Integration rate'}
            tone={integrationRate !== null && integrationRate >= 70 ? C.mint : C.amber}
          />`;
  c = c.slice(0, end) + newStat + c.slice(end);
  console.log('Integration rate stat restored');
} else {
  console.log('CalendarClock not found, trying to insert after stats grid opening');
}

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');

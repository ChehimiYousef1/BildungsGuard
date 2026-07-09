const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

const oldLine = '          <Stat icon={<Users size={18} />} num={stats ? String(stats.active) : \'…\'} label={t(\'active_part\')} tone={C.iris} />';
const newLine = oldLine + '\n          <Stat icon={<TrendingUp size={18} />} num={integrationRate !== null ? integrationRate + \'%\' : \'—\'} label={lang === \'de\' ? \'Eingliederungsquote\' : \'Integration rate\'} tone={integrationRate !== null && integrationRate >= 70 ? C.mint : C.amber} />';

if (c.includes(oldLine)) {
  c = c.replace(oldLine, newLine);
  console.log('Integration rate restored OK');
} else {
  console.log('Line not found - trying partial match');
  const partial = "active_part')} tone={C.iris} />";
  const idx = c.indexOf(partial);
  if (idx > -1) {
    const end = idx + partial.length;
    const insert = "\n          <Stat icon={<TrendingUp size={18} />} num={integrationRate !== null ? integrationRate + '%' : '\u2014'} label={lang === 'de' ? 'Eingliederungsquote' : 'Integration rate'} tone={integrationRate !== null && integrationRate >= 70 ? C.mint : C.amber} />";
    c = c.slice(0, end) + insert + c.slice(end);
    console.log('Restored via partial match');
  } else {
    console.log('ERROR: not found');
  }
}

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');

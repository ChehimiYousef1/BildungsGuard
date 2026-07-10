const fs = require('fs');
let c = fs.readFileSync('src/features/measures/List.tsx', 'utf8');

c = c.replace(
  "<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginTop: 14 }}>",
  "<div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>"
);

// Make cards smaller
c = c.replace(/padding: '12px 14px' \}\}, borderRadius: 10/g, "padding: '8px 12px' }, borderRadius: 8");
c = c.replace(/fontSize: 11, fontWeight: 600/g, "fontSize: 10, fontWeight: 600");
c = c.replace(/fontSize: 26, fontWeight: 800/g, "fontSize: 20, fontWeight: 700");
c = c.replace(/marginBottom: 4/g, "marginBottom: 2");

fs.writeFileSync('src/features/measures/List.tsx', c, 'utf8');
console.log('DONE');

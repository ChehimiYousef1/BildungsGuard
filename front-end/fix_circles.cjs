const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

// Replace TL legend in header with circle legend
c = c.replace(
  '<span style={{ display: \'flex\', alignItems: \'center\', gap: 5 }}><TL s="g" /> {t(\'legend_ok\')}</span>',
  '<span style={{ display: \'flex\', alignItems: \'center\', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: \'50%\', background: \'#0FB6A0\', display: \'inline-block\' }} /> {t(\'legend_ok\')}</span>'
);
c = c.replace(
  '<span style={{ display: \'flex\', alignItems: \'center\', gap: 5 }}><TL s="a" /> {t(\'legend_check\')}</span>',
  '<span style={{ display: \'flex\', alignItems: \'center\', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: \'50%\', background: \'#F59E0B\', display: \'inline-block\' }} /> {t(\'legend_check\')}</span>'
);
c = c.replace(
  '<span style={{ display: \'flex\', alignItems: \'center\', gap: 5 }}><TL s="r" /> {t(\'legend_crit\')}</span>',
  '<span style={{ display: \'flex\', alignItems: \'center\', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: \'50%\', background: \'#F4475F\', display: \'inline-block\' }} /> {t(\'legend_crit\')}</span>'
);

// Replace TL in table cells with circles
const circleHelper = `(s) => {
    const col = s === 'g' ? '#0FB6A0' : s === 'a' ? '#F59E0B' : '#F4475F';
    const label = s === 'g' ? 'OK' : s === 'a' ? '!' : '?';
    return <span title={s === 'g' ? 'OK' : s === 'a' ? 'Check' : 'Critical'} style={{ width: 22, height: 22, borderRadius: '50%', background: col, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>{label}</span>;
  }`;

// Replace each TL in the table
c = c.replace(/<TL s=\{c\.sig\} \/>/g, '{((s) => { const col = s === \'g\' ? \'#0FB6A0\' : s === \'a\' ? \'#F59E0B\' : \'#F4475F\'; return <span title={s === \'g\' ? \'OK\' : s === \'a\' ? \'Check\' : \'Critical\'} style={{ width: 22, height: 22, borderRadius: \'50%\', background: col, display: \'inline-flex\', alignItems: \'center\', justifyContent: \'center\', color: \'#fff\', fontSize: 10, fontWeight: 800 }}>{s === \'g\' ? \'?\' : s === \'a\' ? \'!\' : \'?\'}</span>; })(c.sig)}');
c = c.replace(/<TL s=\{c\.trainer\} \/>/g, '{((s) => { const col = s === \'g\' ? \'#0FB6A0\' : s === \'a\' ? \'#F59E0B\' : \'#F4475F\'; return <span style={{ width: 22, height: 22, borderRadius: \'50%\', background: col, display: \'inline-flex\', alignItems: \'center\', justifyContent: \'center\', color: \'#fff\', fontSize: 10, fontWeight: 800 }}>{s === \'g\' ? \'?\' : s === \'a\' ? \'!\' : \'?\'}</span>; })(c.trainer)}');
c = c.replace(/<TL s=\{c\.cert\} \/>/g, '{((s) => { const col = s === \'g\' ? \'#0FB6A0\' : s === \'a\' ? \'#F59E0B\' : \'#F4475F\'; return <span style={{ width: 22, height: 22, borderRadius: \'50%\', background: col, display: \'inline-flex\', alignItems: \'center\', justifyContent: \'center\', color: \'#fff\', fontSize: 10, fontWeight: 800 }}>{s === \'g\' ? \'?\' : s === \'a\' ? \'!\' : \'?\'}</span>; })(c.cert)}');
c = c.replace(/<TL s=\{c\.complaints\} \/>/g, '{((s) => { const col = s === \'g\' ? \'#0FB6A0\' : s === \'a\' ? \'#F59E0B\' : \'#F4475F\'; return <span style={{ width: 22, height: 22, borderRadius: \'50%\', background: col, display: \'inline-flex\', alignItems: \'center\', justifyContent: \'center\', color: \'#fff\', fontSize: 10, fontWeight: 800 }}>{s === \'g\' ? \'?\' : s === \'a\' ? \'!\' : \'?\'}</span>; })(c.complaints)}');

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');

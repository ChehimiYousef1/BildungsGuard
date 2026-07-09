const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

const oldTable = `          <div className="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>{t('col_meas')}</th>
                  <th className="hide-mobile">Nr.</th>
                  <th style={{ textAlign: 'center' }}>{t('c_sign')}</th>
                  <th style={{ textAlign: 'center' }}>{t('c_train')}</th>
                  <th style={{ textAlign: 'center' }}>{t('c_cert')}</th>
                  <th style={{ textAlign: 'center' }}>{t('c_compl')}</th>
                </tr>
              </thead>
              <tbody>
                {Bootcamps.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 16, color: C.muted, fontSize: 13 }}>
                      {lang === 'de' ? 'Keine Maﬂnahmen' : 'No Bootcamps'}
                    </td>
                  </tr>
                )}
                {Bootcamps.map((m, i) => {
                  const c = compliance(m);
                  return (
                    <tr key={m.id ?? i}>
                      <td className="cell-name">{m.name}</td>
                      <td className="hide-mobile mono" style={{ color: C.muted }}>{m.number ?? m.nr ?? 'ó'}</td>
                      <td style={{ textAlign: 'center' }}>{((s) => { const col = s === 'g' ? '#0FB6A0' : s === 'a' ? '#F59E0B' : '#F4475F'; return <span title={s === 'g' ? 'OK' : s === 'a' ? 'Check' : 'Critical'} style={{ width: 22, height: 22, borderRadius: '50%', background: col, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>{s === 'g' ? '?' : s === 'a' ? '!' : '?'}</span>; })(c.sig)}</td>
                      <td style={{ textAlign: 'center' }}>{((s) => { const col = s === 'g' ? '#0FB6A0' : s === 'a' ? '#F59E0B' : '#F4475F'; return <span style={{ width: 22, height: 22, borderRadius: '50%', background: col, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>{s === 'g' ? '?' : s === 'a' ? '!' : '?'}</span>; })(c.trainer)}</td>
                      <td style={{ textAlign: 'center' }}>{((s) => { const col = s === 'g' ? '#0FB6A0' : s === 'a' ? '#F59E0B' : '#F4475F'; return <span style={{ width: 22, height: 22, borderRadius: '50%', background: col, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>{s === 'g' ? '?' : s === 'a' ? '!' : '?'}</span>; })(c.cert)}</td>
                      <td style={{ textAlign: 'center' }}>{((s) => { const col = s === 'g' ? '#0FB6A0' : s === 'a' ? '#F59E0B' : '#F4475F'; return <span style={{ width: 22, height: 22, borderRadius: '50%', background: col, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>{s === 'g' ? '?' : s === 'a' ? '!' : '?'}</span>; })(c.complaints)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>`;

const newCards = `          {Bootcamps.length === 0 && (
            <div style={{ padding: 20, color: C.muted, fontSize: 13 }}>
              {lang === 'de' ? 'Keine Maﬂnahmen' : 'No Bootcamps'}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, padding: '4px 8px 8px' }}>
            {Bootcamps.map((m, i) => {
              const cp = compliance(m);
              const scores = [cp.sig, cp.trainer, cp.cert, cp.complaints];
              const total = scores.length;
              const good = scores.filter(s => s === 'g').length;
              const pct = Math.round((good / total) * 100);
              const borderCol = pct === 100 ? '#1D9E75' : pct >= 50 ? '#BA7517' : '#A32D2D';
              const scoreCol  = pct === 100 ? '#1D9E75' : pct >= 50 ? '#BA7517' : '#A32D2D';
              const tag = (s, label) => {
                const bg  = s === 'g' ? '#E1F5EE' : s === 'a' ? '#FAEEDA' : '#FCEBEB';
                const col = s === 'g' ? '#085041' : s === 'a' ? '#633806' : '#501313';
                const sym = s === 'g' ? '?' : s === 'a' ? '~' : '?';
                return <span key={label} style={{ fontSize: 10, padding: '2px 7px', background: bg, color: col, borderRadius: 4, fontWeight: 600 }}>{label} {sym}</span>;
              };
              return (
                <div key={m.id ?? i} style={{ border: '0.5px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', borderLeft: \`3px solid \${borderCol}\` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: scoreCol, marginBottom: 8 }}>{pct}%</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {tag(cp.sig,        lang === 'de' ? 'Unterschrift' : 'Sign.')}
                    {tag(cp.trainer,    lang === 'de' ? 'Trainer' : 'Trainer')}
                    {tag(cp.cert,       lang === 'de' ? 'Zertifikat' : 'Cert.')}
                    {tag(cp.complaints, lang === 'de' ? 'Beschwerden' : 'Compl.')}
                  </div>
                </div>
              );
            })}
          </div>`;

if (c.includes(oldTable)) {
  c = c.replace(oldTable, newCards);
  console.log('Table replaced with score cards');
} else {
  console.log('Old table not found - trying partial match');
  const idx = c.indexOf('<div className="scroll-x">');
  if (idx > -1) {
    const end = c.indexOf('</div>', c.indexOf('</table>', idx)) + 6;
    c = c.slice(0, idx) + newCards + c.slice(end);
    console.log('Replaced via partial match');
  }
}

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');

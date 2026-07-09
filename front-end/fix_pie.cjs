const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

const startMarker = '      {widgets.compliance && (';
const endMarker   = '      )}';

const startIdx = c.indexOf(startMarker);
const endIdx   = c.indexOf(endMarker, startIdx) + endMarker.length;

const newSection = `      {widgets.compliance && (
        <div className="card" style={{ padding: '19px 8px 12px' }}>
          <div className="card-head" style={{ padding: '0 13px 14px' }}>
            <div className="card-title">{t('compl_by_meas')}</div>
          </div>
          {Bootcamps.length === 0 && (
            <div style={{ padding: 20, color: C.muted, fontSize: 13 }}>
              {lang === 'de' ? 'Keine Maßnahmen' : 'No Bootcamps'}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, padding: '0 8px 4px' }}>
            {Bootcamps.map((m, i) => {
              const cp = compliance(m);
              const statuses = [
                { key: 'sig',        label: lang === 'de' ? 'Unterschrift' : 'Sign.',   s: cp.sig        },
                { key: 'trainer',    label: lang === 'de' ? 'Trainer'      : 'Trainer', s: cp.trainer    },
                { key: 'cert',       label: lang === 'de' ? 'Zertifikat'   : 'Cert.',   s: cp.cert       },
                { key: 'complaints', label: lang === 'de' ? 'Beschwerden'  : 'Compl.',  s: cp.complaints },
              ];
              const good = statuses.filter(x => x.s === 'g').length;
              const warn = statuses.filter(x => x.s === 'a').length;
              const crit = statuses.filter(x => x.s === 'r').length;
              const total = statuses.length;
              const circ = 2 * Math.PI * 16;
              const gLen = (good / total) * circ;
              const aLen = (warn / total) * circ;
              const rLen = (crit / total) * circ;
              const scoreCol = crit > 0 ? '#A32D2D' : warn > 0 ? '#BA7517' : '#1D9E75';
              const pct = Math.round((good / total) * 100);
              const tagBg  = (s) => s === 'g' ? '#E1F5EE' : s === 'a' ? '#FAEEDA' : '#FCEBEB';
              const tagCol = (s) => s === 'g' ? '#085041' : s === 'a' ? '#633806' : '#501313';
              const tagSym = (s) => s === 'g' ? '?' : s === 'a' ? '~' : '?';
              return (
                <div key={m.id ?? i} style={{ border: '0.5px solid #E2E8F0', borderRadius: 10, padding: '14px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                  <div style={{ position: 'relative', width: 72, height: 72 }}>
                    <svg width="72" height="72" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="16" fill="none" stroke="#E2E8F0" strokeWidth="10"/>
                      {good > 0 && <circle cx="22" cy="22" r="16" fill="none" stroke="#1D9E75" strokeWidth="10"
                        strokeDasharray={`${gLen} ${circ - gLen}`}
                        strokeDashoffset={circ * 0.25}
                        transform="rotate(-90 22 22)"/>}
                      {warn > 0 && <circle cx="22" cy="22" r="16" fill="none" stroke="#BA7517" strokeWidth="10"
                        strokeDasharray={`${aLen} ${circ - aLen}`}
                        strokeDashoffset={circ * 0.25 - gLen}
                        transform="rotate(-90 22 22)"/>}
                      {crit > 0 && <circle cx="22" cy="22" r="16" fill="none" stroke="#A32D2D" strokeWidth="10"
                        strokeDasharray={`${rLen} ${circ - rLen}`}
                        strokeDashoffset={circ * 0.25 - gLen - aLen}
                        transform="rotate(-90 22 22)"/>}
                      <circle cx="22" cy="22" r="10" fill="white"/>
                      <text x="22" y="23" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="700" fill={scoreCol}>{pct}%</text>
                    </svg>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                    {statuses.map(x => (
                      <span key={x.key} style={{ fontSize: 10, padding: '2px 6px', background: tagBg(x.s), color: tagCol(x.s), borderRadius: 4, fontWeight: 600 }}>
                        {x.label} {tagSym(x.s)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 14, padding: '10px 14px 0', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#085041', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1D9E75', display: 'inline-block' }}></span>{lang === 'de' ? 'Konform' : 'Compliant'}</span>
            <span style={{ fontSize: 11, color: '#633806', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#BA7517', display: 'inline-block' }}></span>{lang === 'de' ? 'Prüfen' : 'Review'}</span>
            <span style={{ fontSize: 11, color: '#501313', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#A32D2D', display: 'inline-block' }}></span>{lang === 'de' ? 'Kritisch' : 'Critical'}</span>
          </div>
        </div>
      )}`;

c = c.slice(0, startIdx) + newSection + c.slice(endIdx);
fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');

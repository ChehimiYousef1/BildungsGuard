import { Wand2, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NAV } from '../config/nav';
import { PERSON } from '../config/person';

export default function Sidebar() {
  const { t, lang, role, view, setView, modules, signOut, org, logo, user, accent } = useApp();
  const person   = (PERSON as any)[role];
  const navItems = (NAV as any)[role].filter(([id]: any) => modules[role].includes(id));
  const initial  = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const a1 = accent?.a1 ?? '#6D5DF6';
  const a2 = accent?.a2 ?? '#3B82F6';

  const isQmActive = view === 'qm' || view === 'audit' || view === 'docs';
  const [qmOpen, setQmOpen] = useState(isQmActive);

  const subStyle = (id: string) => view === id ? {
    background: 'rgba(0,0,0,0.15)',
    color: '#fff',
    fontSize: 12.5,
  } : {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12.5,
  };

  return (
    <aside className="sidebar" style={{
      background: `linear-gradient(160deg, ${a1} 0%, ${a2} 100%)`,
    }}>
      {/* Brand */}
      <div className="brand">
        <div className="brand-mark" style={logo
          ? { padding: 0, overflow: 'hidden', background: '#fff' }
          : { background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }
        }>
          {logo
            ? <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Wand2 size={20} />}
        </div>
        <div>
          <div className="brand-name">{org || 'All in One'}</div>
          <div className="brand-sub">{lang === 'de' ? person.de : person.en}</div>
        </div>
      </div>

      {/* Nav */}
      <div className="nav-label" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('modules')}</div>
      <div className="nav-scroll">
        {navItems
          .filter(([id]: any) => id !== 'docs') // docs moved inside QM
          .map(([id, lk, Icon]: any) => {

          // QM item — collapsible with 3 sub-items
          if (id === 'qm') {
            return (
              <div key={id}>
                <button
                  className={'nav-item' + (isQmActive ? ' on' : '')}
                  onClick={() => { setQmOpen(!qmOpen); if (!isQmActive) setView('qm'); }}
                  style={{
                    ...(isQmActive ? {
                      background: 'rgba(0,0,0,0.20)',
                      color: '#fff',
                      backdropFilter: 'blur(8px)',
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
                    } : {
                      color: 'rgba(255,255,255,0.75)',
                    }),
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Icon size={17} />
                    <span>{lang === 'de' ? 'Qualitätsmanagement' : 'Quality Management'}</span>
                  </span>
                  {qmOpen
                    ? <ChevronDown size={13} style={{ opacity: 0.7 }} />
                    : <ChevronRight size={13} style={{ opacity: 0.7 }} />}
                </button>

                {qmOpen && (
                  <div style={{ paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 4 }}>
                    {/* QM Documents */}
                    <button className={'nav-item' + (view === 'qm' ? ' on' : '')}
                      onClick={() => setView('qm')} style={subStyle('qm')}>
                      <span style={{ fontSize: 13 }}>📋</span>
                      <span>{lang === 'de' ? 'QM-Dokumente' : 'QM Documents'}</span>
                    </button>
                    {/* Audit & Reporting */}
                    <button className={'nav-item' + (view === 'audit' ? ' on' : '')}
                      onClick={() => setView('audit')} style={subStyle('audit')}>
                      <span style={{ fontSize: 13 }}>🔍</span>
                      <span>{lang === 'de' ? 'Audit & Reporting' : 'Audit & Reporting'}</span>
                    </button>
                    {/* Documents */}
                    <button className={'nav-item' + (view === 'docs' ? ' on' : '')}
                      onClick={() => setView('docs')} style={subStyle('docs')}>
                      <span style={{ fontSize: 13 }}>📄</span>
                      <span>{lang === 'de' ? 'Dokumente' : 'Documents'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          }

          // Normal nav items
          return (
            <button
              key={id}
              className={'nav-item' + (view === id ? ' on' : '')}
              onClick={() => setView(id)}
              style={view === id ? {
                background: 'rgba(0,0,0,0.20)',
                color: '#fff',
                backdropFilter: 'blur(8px)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
              } : {
                color: 'rgba(255,255,255,0.75)',
              }}
            >
              <Icon size={17} /><span>{t(lk)}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="side-foot">
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '9px 11px', marginBottom: 6, borderRadius: 11,
            background: 'rgba(255,255,255,.10)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: 'rgba(255,255,255,0.25)',
              display: 'grid', placeItems: 'center',
              color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
            }}>
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name || (lang === 'de' ? 'Benutzer' : 'User')}
              </div>
              {user.email && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </div>
              )}
            </div>
          </div>
        )}
        <button className="nav-item" onClick={signOut} style={{ color: 'rgba(255,255,255,0.75)' }}>
          <LogOut size={17} /><span>{t('sign_out')}</span>
        </button>
      </div>
    </aside>
  );
}

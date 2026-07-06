import { Wand2, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NAV } from '../config/nav';
import { PERSON } from '../config/person';

export default function Sidebar() {
  const { t, lang, role, view, setView, modules, signOut, org, logo, user } = useApp();
  const person = (PERSON as any)[role];
  const navItems = (NAV as any)[role].filter(([id]: any) => modules[role].includes(id));
  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" style={logo ? { padding: 0, overflow: 'hidden', background: '#fff' } : undefined}>
          {logo
            ? <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Wand2 size={20} />}
        </div>
        <div>
          <div className="brand-name">{org || 'All in One'}</div>
          <div className="brand-sub">{lang === 'de' ? person.de : person.en}</div>
        </div>
      </div>
      <div className="nav-label">{t('modules')}</div>
      <div className="nav-scroll">
        {navItems.map(([id, lk, Icon]: any) => (
          <button key={id} className={'nav-item' + (view === id ? ' on' : '')} onClick={() => setView(id)}>
            <Icon size={17} /><span>{t(lk)}</span>
          </button>
        ))}
      </div>
      <div className="side-foot">
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', marginBottom: 6, borderRadius: 11, background: 'rgba(255,255,255,.04)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--grad)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name || (lang === 'de' ? 'Benutzer' : 'User')}
              </div>
              {user.email && (
                <div style={{ fontSize: 11, opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </div>
              )}
            </div>
          </div>
        )}
        <button className="nav-item" onClick={signOut}><LogOut size={17} /><span>{t('sign_out')}</span></button>
      </div>
    </aside>
  );
}
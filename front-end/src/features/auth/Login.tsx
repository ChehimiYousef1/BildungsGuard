import { useState } from 'react';
import { Wand2, Lock, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { authApi } from '../../lib/api';
import { LOGIN_ROLES } from '../../config/loginRoles';
import { C } from '../../theme/tokens';

const inputStyle: React.CSSProperties = {
  width: '100%', margin: '6px 0', padding: '8px 10px', borderRadius: 8,
  border: '1px solid #e2e8f0', fontSize: 13, boxSizing: 'border-box',
};

// قواعد التحقّق (نفس الـ backend)
const GMAIL = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const STRONG_PW = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

// اقرأ الشعار + الاسم من localStorage (محفوظان بعد أول دخول)
const savedLogo = (() => { try { const v = localStorage.getItem('pref_logo'); return v ? JSON.parse(v) : null; } catch { return null; } })();
const savedOrg = (() => { try { const v = localStorage.getItem('pref_org'); return v ? JSON.parse(v) : null; } catch { return null; } })();

export default function Login() {
  const { t, lang, setLang, login, register } = useApp();
  const [mode, setMode] = useState<Record<string, 'signin' | 'register'>>({});
  const [name, setName] = useState<Record<string, string>>({});
  const [ident, setIdent] = useState<Record<string, string>>({});
  const [username, setUsername] = useState<Record<string, string>>({});
  const [email, setEmail] = useState<Record<string, string>>({});
  const [pwd, setPwd] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'err' | 'ok'; text: string } | null>(null);

  const m = (id: string) => mode[id] ?? 'signin';

  const submit = async (r: any) => {
    setMsg(null);
    // تحقّق فوري عند التسجيل (register) فقط — لا عند الدخول
    if (r.dynamic && !r.signInOnly && m(r.id) === 'register') {
      if (!GMAIL.test(email[r.id] ?? '')) {
        setMsg({ type: 'err', text: lang === 'de' ? 'E-Mail muss eine @gmail.com-Adresse sein.' : 'Email must be a @gmail.com address.' });
        return;
      }
      if (!STRONG_PW.test(pwd[r.id] ?? '')) {
        setMsg({ type: 'err', text: lang === 'de' ? 'Passwort: min. 6 Zeichen, mit Buchstabe, Zahl und Sonderzeichen.' : 'Password: min 6 chars, with letter, number and symbol.' });
        return;
      }
    }
    setBusy(r.id);
    try {
      if (r.dynamic && !r.signInOnly && m(r.id) === 'register') {
        await register(r.id, {
          name: name[r.id] ?? '',
          email: email[r.id] ?? '',
          password: pwd[r.id] ?? '',
          username: username[r.id] || undefined,
        });
      } else {
        const body = r.dynamic
          ? { email: ident[r.id] ?? '', password: pwd[r.id] ?? '' }
          : { email: r.email, password: pwd[r.id] ?? '' };
        await login(r.id, body);
      }
    } catch (e: any) {
      setMsg({ type: 'err', text: e?.message || (lang === 'de' ? 'Fehlgeschlagen' : 'Failed') });
    } finally { setBusy(null); }
  };

  const forgot = async (r: any) => {
    const e = ident[r.id] || window.prompt(lang === 'de' ? 'E-Mail für Zurücksetzen:' : 'Email for reset:') || '';
    if (!e) return;
    try {
      await authApi.forgotPassword(e);
      setMsg({ type: 'ok', text: lang === 'de' ? 'Falls die E-Mail existiert, wurde ein Link gesendet.' : 'If that email exists, a reset link was sent.' });
    } catch (err: any) { setMsg({ type: 'err', text: err?.message || 'Error' }); }
  };

  return (
    <div className="login">
      <div className="login-card">
        <div className="login-top">
          <div className="login-brand">
            <div className="login-mark" style={savedLogo ? { padding: 0, overflow: 'hidden', background: '#fff' } : undefined}>
              {savedLogo
                ? <img src={savedLogo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Wand2 size={24} />}
            </div>
            <div><div className="login-name">{savedOrg || 'All in One'}</div><div className="login-tag">AZAV · LMS &amp; QM</div></div>
          </div>
          <div className="lang">
            <button className={lang === 'de' ? 'on' : ''} onClick={() => setLang('de')}>DE</button>
            <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
        </div>
        <div className="login-h">{t('login_h')}</div>
        <div className="login-sub">{t('login_sub')}</div>
        <div className="login-roles">
          {LOGIN_ROLES.map((r: any) => (
            <div key={r.id} className="login-role">
              <div className="login-orb" style={{ background: r.col }}><r.ic size={26} /></div>
              <div className="login-role-name">{t(r.lk)}</div>
              <div className="login-role-desc">{t(r.dk)}</div>

              {r.dynamic ? (
                <>
                  {!r.signInOnly && (
                  <div style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
                    <button onClick={() => setMode((x) => ({ ...x, [r.id]: 'signin' }))}
                      style={{ flex: 1, padding: '5px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                        border: '1px solid #e2e8f0', background: m(r.id) === 'signin' ? '#EEF0FF' : '#fff' }}>
                      {lang === 'de' ? 'Anmelden' : 'Sign in'}
                    </button>
                    <button onClick={() => setMode((x) => ({ ...x, [r.id]: 'register' }))}
                      style={{ flex: 1, padding: '5px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                        border: '1px solid #e2e8f0', background: m(r.id) === 'register' ? '#EEF0FF' : '#fff' }}>
                      {lang === 'de' ? 'Registrieren' : 'Register'}
                    </button>
                  </div>
                  )}

                  {!r.signInOnly && m(r.id) === 'register' ? (
                    <>
                      <input type="text" placeholder={lang === 'de' ? 'Name' : 'Name'} value={name[r.id] ?? ''}
                        onChange={(e) => setName((x) => ({ ...x, [r.id]: e.target.value }))} style={inputStyle} />
                      <input type="text" placeholder={lang === 'de' ? 'Benutzername (optional)' : 'Username (optional)'} value={username[r.id] ?? ''}
                        onChange={(e) => setUsername((x) => ({ ...x, [r.id]: e.target.value }))} style={inputStyle} />
                      <input type="email" placeholder="name@gmail.com" value={email[r.id] ?? ''}
                        onChange={(e) => setEmail((x) => ({ ...x, [r.id]: e.target.value }))} style={inputStyle} />
                    </>
                  ) : (
                    <input type="text" placeholder={lang === 'de' ? 'Benutzername oder Gmail' : 'Username or Gmail'} value={ident[r.id] ?? ''}
                      onChange={(e) => setIdent((x) => ({ ...x, [r.id]: e.target.value }))} style={inputStyle} />
                  )}
                </>
              ) : (
                <div className="login-email">{r.email}</div>
              )}

              <input type="password" placeholder={lang === 'de' ? 'Passwort' : 'Password'} value={pwd[r.id] ?? ''}
                onChange={(e) => setPwd((x) => ({ ...x, [r.id]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(r); }} style={inputStyle} />

              <button className="login-btn" disabled={busy === r.id} onClick={() => submit(r)}>
                <Lock size={14} /> {busy === r.id ? '…' : (r.dynamic && !r.signInOnly && m(r.id) === 'register' ? (lang === 'de' ? 'Konto erstellen' : 'Create account') : t('sign_in'))}
              </button>

              {r.dynamic && (r.signInOnly || m(r.id) === 'signin') && (
                <button onClick={() => forgot(r)}
                  style={{ background: 'none', border: 'none', color: '#6D5DF6', fontSize: 12, marginTop: 8, cursor: 'pointer' }}>
                  {lang === 'de' ? 'Passwort vergessen?' : 'Forgot password?'}
                </button>
              )}
            </div>
          ))}
        </div>
        {msg && <div style={{ color: msg.type === 'err' ? '#ef4444' : '#0FB6A0', marginTop: 10, fontSize: 13, textAlign: 'center' }}>{msg.text}</div>}
        <div className="login-foot"><ShieldCheck size={14} color={C.mint} /> {t('login_demo')} · DSGVO · RBAC</div>
      </div>
    </div>
  );
}
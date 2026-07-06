import { useState } from 'react';
import { authApi } from '../../lib/api';

export default function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    try { await authApi.resetPassword(token, password); setDone(true); }
    catch (e: any) { setErr(e?.message || 'Error'); }
  };

  return (
    <div className="login">
      <div className="login-card" style={{ maxWidth: 420 }}>
        <div className="login-h">Neues Passwort</div>
        {done ? (
          <p>Passwort geändert. <a href="/">Zum Login</a></p>
        ) : !token ? (
          <p style={{ color: '#ef4444' }}>Kein gültiger Token.</p>
        ) : (
          <>
            <input type="password" placeholder="Neues Passwort (min. 6 Zeichen)" value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', margin: '10px 0', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <button className="login-btn" onClick={submit}>Passwort speichern</button>
            {err && <div style={{ color: '#ef4444', marginTop: 8 }}>{err}</div>}
          </>
        )}
      </div>
    </div>
  );
}
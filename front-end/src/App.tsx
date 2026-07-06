import React from 'react';
import { useApp } from './context/AppContext';
import { STYLES } from './theme/styles';
import Login from './features/auth/Login';
import ResetPassword from './features/auth/ResetPassword';
import Shell from './layout/Shell';


export default function App() {
  const { authed, accent } = useApp();
  const accentVars = { ['--a1']: accent.a1, ['--a2']: accent.a2 } as React.CSSProperties;
  const isReset = window.location.pathname === '/reset-password';
  return (
    <div className="ax" style={accentVars}>
      <style>{STYLES}</style>
      {isReset ? <ResetPassword /> : authed ? <Shell /> : <Login />}
    </div>
  );
}
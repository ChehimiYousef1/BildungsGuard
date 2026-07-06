import { C, AURORA } from './tokens';

export const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; }
.ax, .ax * { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
.ax { --a1: #6D5DF6; --a2: #3B82F6; --grad: linear-gradient(135deg, var(--a1), var(--a2)); display: flex; min-height: 780px; height: 100%; background: ${C.bg}; color: ${C.ink}; font-size: 14px; line-height: 1.5; }
.ax .disp { font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.01em; }
.ax .mono { font-family: 'JetBrains Mono', monospace; }

.ax .sidebar { width: 254px; flex-shrink: 0; background: ${C.sidebar}; background-image: radial-gradient(120% 60% at 0% 0%, rgba(109,93,246,.22), transparent 60%); color: #DDE0EE; display: flex; flex-direction: column; padding: 18px 13px; position: sticky; top: 0; height: 100vh; max-height: 100vh; }
.ax .brand { display: flex; align-items: center; gap: 11px; padding: 4px 6px 16px; }
.ax .brand-mark { width: 36px; height: 36px; border-radius: 11px; background: ${AURORA}; display: grid; place-items: center; color: #fff; flex-shrink: 0; box-shadow: 0 6px 16px -4px rgba(109,93,246,.6); }
.ax .brand-name { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: #fff; }
.ax .brand-sub { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #8489A6; margin-top: 1px; }

.ax .role-switch { display: flex; background: rgba(255,255,255,0.06); border-radius: 11px; padding: 3px; margin-bottom: 18px; gap: 2px; }
.ax .role-btn { flex: 1; border: none; background: transparent; color: #AEB2C9; font-size: 10.5px; font-weight: 600; padding: 7px 3px; border-radius: 8px; cursor: pointer; transition: .18s; }
.ax .role-btn:hover { color: #fff; }
.ax .role-btn.on { background: #fff; color: ${C.ink}; }

.ax .nav-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: #6A6F8C; padding: 0 8px 8px; }
.ax .nav-scroll { overflow-y: auto; flex: 1; margin: 0 -3px; padding: 0 3px; }
.ax .nav-item { display: flex; align-items: center; gap: 11px; width: 100%; border: none; background: transparent; color: #BBBFD4; font-size: 13px; font-weight: 500; padding: 9px 11px; border-radius: 10px; cursor: pointer; text-align: left; transition: .16s; margin-bottom: 2px; }
.ax .nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
.ax .nav-item.on { background: var(--grad); color: #fff; box-shadow: 0 8px 18px -8px rgba(91,71,223,.8); font-weight: 600; }
.ax .nav-item svg { flex-shrink: 0; }

.ax .side-foot { margin-top: auto; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); }
.ax .me { display: flex; align-items: center; gap: 10px; padding: 4px 6px; }
.ax .avatar { border-radius: 50%; flex-shrink: 0; display: grid; place-items: center; font-weight: 700; color: #fff; }
.ax .me-name { font-size: 13px; font-weight: 600; color: #fff; }
.ax .me-role { font-size: 11px; color: #8489A6; }

.ax .main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ax .topbar { display: flex; align-items: center; gap: 14px; padding: 16px 28px; border-bottom: 1px solid ${C.line}; background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); position: sticky; top: 0; z-index: 20; }
.ax .page-title { font-family: 'Space Grotesk', sans-serif; font-size: 23px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
.ax .page-sub { color: ${C.muted}; font-size: 12.5px; margin-top: 2px; }
.ax .spacer { flex: 1; }
.ax .lang { display: inline-flex; background: ${C.soft}; border: 1px solid ${C.line}; border-radius: 10px; padding: 3px; gap: 2px; }
.ax .lang button { border: none; background: none; font-size: 11px; font-weight: 700; padding: 5px 9px; border-radius: 7px; cursor: pointer; color: ${C.muted}; }
.ax .lang button.on { background: ${C.ink}; color: #fff; }
.ax .tenant-chip { display: flex; align-items: center; gap: 9px; background: ${C.surface}; border: 1px solid ${C.line}; border-radius: 12px; padding: 7px 13px; }
.ax .tenant-name { font-size: 12.5px; font-weight: 600; line-height: 1.2; }
.ax .tenant-cert { font-size: 10.5px; color: ${C.mint}; display: flex; align-items: center; gap: 3px; }
.ax .icon-btn { width: 40px; height: 40px; border-radius: 11px; border: 1px solid ${C.line}; background: ${C.surface}; display: grid; place-items: center; cursor: pointer; color: ${C.inkSoft}; position: relative; }
.ax .icon-btn:hover { border-color: ${C.iris}; }
.ax .dot { position: absolute; top: 9px; right: 10px; width: 7px; height: 7px; border-radius: 50%; background: ${C.rose}; border: 2px solid ${C.surface}; }
.ax .ai-trigger { display: inline-flex; align-items: center; gap: 7px; border: none; border-radius: 11px; padding: 9px 14px; font-size: 12.5px; font-weight: 600; color: #fff; cursor: pointer; background: var(--grad); box-shadow: 0 8px 18px -8px rgba(91,71,223,.7); }
.ax .ai-trigger:hover { filter: brightness(1.05); }

.ax .content { padding: 24px 28px 60px; overflow-y: auto; animation: fade .35s ease; }
@keyframes fade { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: none; } }

.ax .grid { display: grid; gap: 15px; }
.ax .card { background: ${C.surface}; border: 1px solid ${C.line}; border-radius: 18px; padding: 19px; box-shadow: 0 1px 2px rgba(23,27,46,.04); }
.ax .card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; gap: 12px; flex-wrap: wrap; }
.ax .card-title { font-family: 'Space Grotesk', sans-serif; font-size: 15.5px; font-weight: 600; }
.ax .card-link { color: ${C.iris}; font-size: 12.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; border: none; background: none; }

.ax .stat { background: ${C.surface}; border: 1px solid ${C.line}; border-radius: 18px; padding: 17px 18px 15px; box-shadow: 0 1px 2px rgba(23,27,46,.04); }
.ax .stat-top { display: flex; align-items: center; justify-content: space-between; }
.ax .stat-icon { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; }
.ax .stat-num { font-family: 'Space Grotesk', sans-serif; font-size: 27px; font-weight: 700; letter-spacing: -0.02em; margin-top: 12px; line-height: 1; }
.ax .stat-label { font-size: 12px; color: ${C.muted}; margin-top: 5px; }
.ax .trend { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 2px; }

.ax .bar { height: 8px; background: ${C.lineSoft}; border-radius: 20px; overflow: hidden; }
.ax .bar-fill { height: 100%; border-radius: 20px; background: var(--grad); transition: width .5s ease; }
.ax .bar-fill.done { background: ${C.mint}; }
.ax .bar-fill.low { background: ${C.rose}; }

.ax .badge { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
.ax .btn { border: none; border-radius: 11px; font-size: 13px; font-weight: 600; padding: 10px 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; transition: filter .15s, transform .12s; }
.ax .btn:active { transform: translateY(1px); }
.ax .btn-primary { background: var(--grad); color: #fff; box-shadow: 0 8px 18px -8px rgba(91,71,223,.6); }
.ax .btn-primary:hover { filter: brightness(1.05); }
.ax .btn-ghost { background: ${C.surface}; color: ${C.ink}; border: 1px solid ${C.line}; }
.ax .btn-ghost:hover { border-color: ${C.iris}; }
.ax .btn-mint { background: ${C.mint}; color: #fff; }

.ax table { width: 100%; border-collapse: collapse; }
.ax th { font-size: 10px; letter-spacing: 0.07em; text-transform: uppercase; color: ${C.muted}; text-align: left; padding: 0 13px 11px; font-weight: 600; }
.ax td { padding: 12px 13px; border-top: 1px solid ${C.lineSoft}; font-size: 13px; vertical-align: middle; }
.ax tr.row { cursor: pointer; }
.ax tr.row:hover td { background: ${C.soft}; }
.ax .cell-user { display: flex; align-items: center; gap: 10px; }
.ax .cell-name { font-weight: 600; }
.ax .cell-sub { font-size: 11.5px; color: ${C.muted}; }
.ax .scroll-x { overflow-x: auto; }

.ax .tl { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
.ax .tabs { display: flex; gap: 4px; border-bottom: 1px solid ${C.line}; margin-bottom: 20px; flex-wrap: wrap; }
.ax .tab { border: none; background: none; padding: 10px 14px; font-size: 13px; font-weight: 600; color: ${C.muted}; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.ax .tab:hover { color: ${C.ink}; }
.ax .tab.on { color: ${C.iris}; border-bottom-color: ${C.iris}; }

.ax .detail-head { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.ax .back { display: inline-flex; align-items: center; gap: 5px; color: ${C.muted}; font-size: 12.5px; font-weight: 600; border: none; background: none; cursor: pointer; margin-bottom: 14px; }
.ax .back:hover { color: ${C.ink}; }
.ax .doc-row { display: flex; align-items: center; gap: 11px; padding: 11px 0; border-top: 1px solid ${C.lineSoft}; }
.ax .doc-row:first-child { border-top: none; }

.ax .att-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 11px; }
.ax .att-row:hover { background: ${C.soft}; }
.ax .seg { display: inline-flex; background: ${C.soft}; border: 1px solid ${C.line}; border-radius: 10px; padding: 2px; gap: 2px; }
.ax .seg button { border: none; background: none; font-size: 11.5px; font-weight: 600; padding: 5px 11px; border-radius: 7px; cursor: pointer; color: ${C.muted}; }
.ax .seg button.p { background: ${C.mint}; color: #fff; }
.ax .seg button.e { background: ${C.amber}; color: #fff; }
.ax .seg button.a { background: ${C.rose}; color: #fff; }

.ax .kpi { background: ${C.surface}; border: 1px solid ${C.line}; border-radius: 18px; padding: 18px; box-shadow: 0 1px 2px rgba(23,27,46,.04); }
.ax .kpi-val { font-family: 'Space Grotesk', sans-serif; font-size: 30px; font-weight: 700; letter-spacing: -0.02em; }
.ax .toast { background: ${C.mint}22; border: 1px solid ${C.mint}; border-radius: 14px; padding: 15px 17px; margin-bottom: 18px; display: flex; gap: 11px; align-items: flex-start; animation: fade .3s ease; }

/* assistant */
.ax .fab { position: fixed; bottom: 24px; right: 24px; z-index: 70; width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer; background: ${AURORA}; background-size: 200% 200%; color: #fff; display: grid; place-items: center; box-shadow: 0 18px 38px -10px rgba(109,93,246,.75); animation: shift 7s ease infinite; }
.ax .fab::before { content: ''; position: absolute; inset: -5px; border-radius: 50%; background: ${AURORA}; z-index: -1; animation: halo 2.6s ease-out infinite; }
@keyframes halo { 0% { transform: scale(1); opacity: .45; } 100% { transform: scale(1.55); opacity: 0; } }
@keyframes shift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
.ax .fab:hover { transform: translateY(-2px) scale(1.06); }
.ax .ai-panel { position: fixed; bottom: 24px; right: 24px; z-index: 70; width: 412px; max-width: calc(100vw - 28px); height: 636px; max-height: calc(100vh - 42px); background: ${C.surface}; border: 1px solid ${C.line}; border-radius: 24px; box-shadow: 0 50px 90px -30px rgba(23,27,46,.55), 0 0 0 1px rgba(109,93,246,.06); display: flex; flex-direction: column; overflow: hidden; animation: slideup .3s cubic-bezier(.2,.9,.3,1); }
@keyframes slideup { from { opacity: 0; transform: translateY(22px) scale(.98); } to { opacity: 1; transform: none; } }
.ax .ai-head { position: relative; background: ${AURORA}; background-size: 200% 200%; animation: shift 9s ease infinite; color: #fff; padding: 17px 16px; display: flex; align-items: center; gap: 12px; overflow: hidden; }
.ax .ai-head::after { content: ''; position: absolute; inset: 0; background: radial-gradient(120% 110% at 100% 0%, rgba(255,255,255,.28), transparent 55%); pointer-events: none; }
.ax .ai-orb-sm { position: relative; z-index: 1; width: 42px; height: 42px; border-radius: 14px; background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.4); display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 6px 16px rgba(0,0,0,.18); }
.ax .ai-htext { position: relative; z-index: 1; }
.ax .ai-name { font-family: 'Space Grotesk', sans-serif; font-size: 17px; font-weight: 700; letter-spacing: -0.01em; }
.ax .ai-sub { font-size: 10.5px; color: rgba(255,255,255,.92); display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.ax .ai-live { width: 6px; height: 6px; border-radius: 50%; background: #8BFFDA; animation: pulse 2s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(139,255,218,.7); } 70% { box-shadow: 0 0 0 6px rgba(139,255,218,0); } 100% { box-shadow: 0 0 0 0 rgba(139,255,218,0); } }
.ax .ai-close { position: relative; z-index: 1; margin-left: auto; background: rgba(255,255,255,.2); border: none; color: #fff; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; display: grid; place-items: center; }
.ax .ai-close:hover { background: rgba(255,255,255,.32); }
.ax .ai-msgs { flex: 1; overflow-y: auto; padding: 18px 16px; display: flex; flex-direction: column; gap: 13px; background: ${C.soft}; }

.ax .ai-row { display: flex; gap: 9px; align-items: flex-start; max-width: 93%; }
.ax .ai-av { width: 27px; height: 27px; border-radius: 9px; background: var(--grad); display: grid; place-items: center; color: #fff; flex-shrink: 0; margin-top: 1px; box-shadow: 0 4px 10px -3px rgba(91,71,223,.55); }
.ax .ai-col { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.ax .ai-bubble { padding: 11px 14px; border-radius: 16px; font-size: 13px; line-height: 1.55; white-space: pre-wrap; word-wrap: break-word; }
.ax .ai-bubble.user { align-self: flex-end; max-width: 88%; background: var(--grad); color: #fff; border-bottom-right-radius: 5px; box-shadow: 0 8px 18px -8px rgba(91,71,223,.5); }
.ax .ai-bubble.bot { background: ${C.surface}; border: 1px solid ${C.line}; color: ${C.ink}; border-bottom-left-radius: 5px; box-shadow: 0 2px 10px rgba(23,27,46,.05); }

.ax .ai-hero { text-align: center; padding: 16px 8px 4px; }
.ax .ai-orb { width: 66px; height: 66px; border-radius: 21px; margin: 0 auto 15px; background: ${AURORA}; background-size: 200% 200%; animation: shift 7s ease infinite; display: grid; place-items: center; color: #fff; box-shadow: 0 16px 34px -10px rgba(109,93,246,.7); }
.ax .ai-hello { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; }
.ax .ai-intro { color: ${C.muted}; font-size: 12.5px; margin: 7px auto 0; max-width: 310px; line-height: 1.55; }
.ax .ai-caps { display: flex; flex-direction: column; gap: 9px; margin-top: 18px; text-align: left; }
.ax .ai-cap { display: flex; align-items: center; gap: 12px; border: 1px solid ${C.line}; background: ${C.surface}; border-radius: 14px; padding: 11px 13px; cursor: pointer; transition: .16s; }
.ax .ai-cap:hover { border-color: ${C.iris}; transform: translateY(-1px); box-shadow: 0 8px 18px -10px rgba(91,71,223,.35); }
.ax .ai-cap-ic { width: 34px; height: 34px; border-radius: 11px; flex-shrink: 0; display: grid; place-items: center; }
.ax .ai-cap-tx { font-size: 12.5px; font-weight: 600; color: ${C.ink}; line-height: 1.35; }

.ax .ai-act { display: flex; align-items: center; gap: 11px; width: 100%; border: 1px solid ${C.iris}38; background: linear-gradient(135deg, ${C.iris}12, ${C.blue}10); border-radius: 14px; padding: 10px 12px; cursor: pointer; text-align: left; transition: .15s; }
.ax .ai-act:hover { border-color: ${C.iris}; transform: translateY(-1px); box-shadow: 0 9px 20px -10px rgba(91,71,223,.5); }
.ax .ai-act-ic { width: 31px; height: 31px; border-radius: 10px; flex-shrink: 0; display: grid; place-items: center; background: var(--grad); color: #fff; }
.ax .ai-act-tx { flex: 1; font-size: 12.5px; font-weight: 600; color: ${C.irisDark}; line-height: 1.35; }
.ax .ai-act-go { color: ${C.iris}; flex-shrink: 0; }
.ax .ai-act.done { border-color: ${C.mint}; background: ${C.mint}14; cursor: default; }
.ax .ai-act.done .ai-act-ic { background: ${C.mint}; }
.ax .ai-act.done .ai-act-tx { color: ${C.mint}; }

.ax .ai-dots span { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${C.mutedLight}; margin-right: 3px; animation: blink 1.2s infinite; }
.ax .ai-dots span:nth-child(2) { animation-delay: .2s; } .ax .ai-dots span:nth-child(3) { animation-delay: .4s; }
@keyframes blink { 0%,60%,100% { opacity: .3; } 30% { opacity: 1; } }

.ax .ai-foot { border-top: 1px solid ${C.line}; padding: 12px 12px 11px; background: ${C.surface}; }
.ax .ai-inputwrap { display: flex; gap: 9px; align-items: flex-end; }
.ax .ai-text { flex: 1; border: 1px solid ${C.line}; border-radius: 14px; padding: 11px 13px; font-size: 13px; resize: none; outline: none; font-family: inherit; max-height: 110px; background: ${C.soft}; color: ${C.ink}; line-height: 1.4; transition: border-color .15s, background .15s; }
.ax .ai-text:focus { border-color: ${C.iris}; background: ${C.surface}; }
.ax .ai-send { width: 42px; height: 42px; flex-shrink: 0; border: none; border-radius: 50%; background: var(--grad); color: #fff; cursor: pointer; display: grid; place-items: center; box-shadow: 0 8px 18px -8px rgba(91,71,223,.6); transition: filter .15s, transform .12s; }
.ax .ai-send:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }
.ax .ai-send:disabled { opacity: .45; cursor: default; box-shadow: none; }
.ax .ai-hint { text-align: center; font-size: 10px; color: ${C.mutedLight}; margin-top: 9px; }

.ax .hide-mobile { display: revert; }
@media (max-width: 940px) {
  .ax { flex-direction: column; }
  .ax .sidebar { width: 100%; height: auto; position: relative; padding: 13px; }
  .ax .nav-scroll { display: flex; gap: 4px; overflow-x: auto; }
  .ax .nav-label, .ax .side-foot { display: none; }
  .ax .nav-item { white-space: nowrap; width: auto; }
  .ax .content { padding: 16px 14px 40px; }
  .ax .topbar { padding: 12px 14px; }
  .ax .hide-mobile { display: none; }
  .ax .player2 { grid-template-columns: 1fr !important; }
}
@media (prefers-reduced-motion: reduce) { .ax *, .ax *::before { animation: none !important; transition: none !important; } }
.ax :focus-visible { outline: 2.5px solid ${C.iris}; outline-offset: 2px; }
/* accent variable overrides */
.ax .nav-item.on, .ax .btn-primary, .ax .ai-trigger, .ax .bar-fill, .ax .ai-av, .ax .ai-bubble.user, .ax .ai-act-ic, .ax .ai-send, .ax .login-btn, .ax .sw.on { background: var(--grad); }

/* login */
.ax .login { flex: 1; position: relative; overflow: hidden; display: grid; place-items: center; padding: 24px; }
.ax .login::before { content: ''; position: absolute; width: 540px; height: 540px; border-radius: 50%; background: ${AURORA}; filter: blur(120px); opacity: .26; top: -170px; right: -130px; }
.ax .login::after { content: ''; position: absolute; width: 460px; height: 460px; border-radius: 50%; background: linear-gradient(135deg, #0FB6A0, #3B82F6); filter: blur(130px); opacity: .18; bottom: -170px; left: -130px; }
.ax .login-card { position: relative; z-index: 1; width: 100%; max-width: 800px; background: ${C.surface}; border: 1px solid ${C.line}; border-radius: 28px; padding: 36px; box-shadow: 0 50px 100px -34px rgba(23,27,46,.42); }
.ax .login-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 26px; flex-wrap: wrap; gap: 12px; }
.ax .login-brand { display: flex; align-items: center; gap: 12px; }
.ax .login-mark { width: 46px; height: 46px; border-radius: 14px; background: ${AURORA}; background-size: 200% 200%; animation: shift 7s ease infinite; display: grid; place-items: center; color: #fff; box-shadow: 0 12px 26px -8px rgba(109,93,246,.6); }
.ax .login-name { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
.ax .login-tag { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${C.muted}; margin-top: 2px; }
.ax .login-h { font-family: 'Space Grotesk', sans-serif; font-size: 27px; font-weight: 700; letter-spacing: -0.02em; }
.ax .login-sub { color: ${C.muted}; font-size: 13px; margin: 5px 0 24px; }
.ax .login-roles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.ax .login-role { border: 1px solid ${C.line}; border-radius: 18px; padding: 22px 18px; display: flex; flex-direction: column; align-items: center; text-align: center; background: ${C.surface}; transition: .16s; }
.ax .login-role:hover { border-color: ${C.iris}; transform: translateY(-3px); box-shadow: 0 18px 38px -18px rgba(91,71,223,.4); }
.ax .login-orb { width: 56px; height: 56px; border-radius: 17px; display: grid; place-items: center; color: #fff; margin-bottom: 14px; box-shadow: 0 10px 22px -8px rgba(23,27,46,.3); }
.ax .login-role-name { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; }
.ax .login-role-desc { font-size: 11.5px; color: ${C.muted}; margin-top: 6px; line-height: 1.5; min-height: 52px; }
.ax .login-email { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: ${C.inkSoft}; background: ${C.soft}; border-radius: 8px; padding: 7px 8px; margin: 13px 0; width: 100%; }
.ax .login-btn { width: 100%; border: none; border-radius: 12px; padding: 11px; font-size: 13px; font-weight: 600; color: #fff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 7px; box-shadow: 0 8px 18px -8px rgba(91,71,223,.5); transition: filter .15s, transform .12s; }
.ax .login-btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
.ax .login-foot { margin-top: 26px; display: flex; align-items: center; gap: 8px; font-size: 11.5px; color: ${C.muted}; }
@media (max-width: 760px) { .ax .login-roles { grid-template-columns: 1fr; } .ax .login-card { padding: 24px; } }

/* switch + settings */
.ax .sw { width: 42px; height: 24px; border-radius: 20px; background: ${C.line}; position: relative; cursor: pointer; transition: background .18s; border: none; flex-shrink: 0; padding: 0; }
.ax .sw::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: left .18s; box-shadow: 0 1px 3px rgba(0,0,0,.25); }
.ax .sw.on::after { left: 20px; }
.ax .sw:disabled { opacity: .45; cursor: default; }
.ax .set-row { display: flex; align-items: center; gap: 12px; padding: 13px 0; border-top: 1px solid ${C.lineSoft}; }
.ax .set-row:first-child { border-top: none; }
.ax .field { display: flex; gap: 9px; }
.ax .input { flex: 1; border: 1px solid ${C.line}; border-radius: 12px; padding: 10px 13px; font-size: 13px; outline: none; font-family: inherit; background: ${C.surface}; color: ${C.ink}; }
.ax .input:focus { border-color: ${C.iris}; }
.ax .swatch { width: 34px; height: 34px; border-radius: 10px; cursor: pointer; border: 3px solid transparent; box-shadow: 0 0 0 1px ${C.line}; }
.ax .swatch.on { border-color: #fff; box-shadow: 0 0 0 2px ${C.ink}; }

/* settings extras */
.ax .set-grid { display: grid; gap: 15px; grid-template-columns: 1fr 1fr; }
.ax .set-section-t { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.ax .set-section-s { font-size: 12px; color: ${C.muted}; margin-bottom: 16px; }
.ax .tg-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-top: 1px solid ${C.lineSoft}; }
.ax .tg-row:first-of-type { border-top: none; }
.ax .tg-ic { width: 34px; height: 34px; border-radius: 10px; background: ${C.soft}; display: grid; place-items: center; color: ${C.inkSoft}; flex-shrink: 0; }
.ax .tg-name { flex: 1; font-size: 13px; font-weight: 600; }
.ax .acc-row { display: flex; gap: 11px; flex-wrap: wrap; }
.ax .acc { width: 46px; height: 46px; border-radius: 13px; cursor: pointer; border: 2.5px solid transparent; box-shadow: 0 0 0 1px ${C.line}; position: relative; }
.ax .acc.on { border-color: ${C.ink}; }
.ax .acc.on::after { content: '✓'; position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font-weight: 700; font-size: 16px; }
.ax .chan-ic { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; }
.ax .cat-chips { display: flex; flex-wrap: wrap; gap: 8px; min-height: 24px; }
.ax .cat-chip { display: inline-flex; align-items: center; gap: 7px; background: ${C.soft}; border: 1px solid ${C.line}; border-radius: 9px; padding: 7px 8px 7px 11px; font-size: 12.5px; font-weight: 600; color: ${C.ink}; }
.ax .cat-chip button { border: none; background: transparent; cursor: pointer; color: ${C.muted}; display: grid; place-items: center; padding: 2px; border-radius: 5px; }
.ax .cat-chip button:hover { color: ${C.rose}; background: ${C.rose}1A; }
.ax .cat-add { display: flex; gap: 9px; margin-top: 14px; }
.ax .icon-mini { width: 26px; height: 26px; border-radius: 7px; border: 1px solid ${C.line}; background: ${C.surface}; color: ${C.inkSoft}; cursor: pointer; display: grid; place-items: center; flex-shrink: 0; }
.ax .icon-mini:hover:not(:disabled) { border-color: ${C.iris}; color: ${C.iris}; }
.ax .icon-mini:disabled { opacity: .35; cursor: default; }
.ax ::-webkit-scrollbar { width: 9px; height: 9px; }
.ax ::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 10px; }
`;

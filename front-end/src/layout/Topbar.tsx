import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Building2, BadgeCheck, Bell, X,
  AlertTriangle, CheckCircle2, Clock, UserX,
  FileText, GraduationCap, Laptop, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TITLES } from '../i18n/titles';
import { C } from '../theme/tokens';
import { TRAEGER } from '../data';
import { api } from '../lib/api';

type Notif = {
  id:      string;
  type:    'warning' | 'error' | 'info' | 'success';
  icon:    React.ReactNode;
  title:   string;
  detail:  string;
  time:    string;
  read:    boolean;
  navTo?:  string;
};

export default function Topbar() {
  const { t, lang, role, view, setLang, setAiOpen, org, setView } = useApp();
  const de = lang === 'de';

  const key      = role + '/' + view;
  const titleRow = (TITLES as any)[key] ? (TITLES as any)[key][lang] : ['', ''];

  const [open,    setOpen]    = useState(false);
  const [notifs,  setNotifs]  = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // ===== Close on outside click =====
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ===== Load notifications =====
  const loadNotifs = async () => {
    setLoading(true);
    try {
      const [parts, trainers, capa, loans, docs] = await Promise.all([
        api<any[]>('/participants').catch(() => []),
        api<any[]>('/trainers').catch(() => []),
        api<any[]>('/capa').catch(() => []),
        api<any[]>('/equipment-loans').catch(() => []),
        api<any[]>('/documents').catch(() => []),
      ]);

      const list: Notif[] = [];
      const now = Date.now();

      // ---- No-show / dropped ----
      const alerts = (Array.isArray(parts) ? parts : []).filter((p) => p.status === 'no_show' || p.status === 'dropped');
      if (alerts.length > 0) {
        list.push({
          id: 'noshow', type: 'error',
          icon: <UserX size={15} />,
          title: de ? `${alerts.length} Nicht-Antritt / Abbruch` : `${alerts.length} No-show / Dropout`,
          detail: de ? 'AZAV-Dokumentation erforderlich' : 'AZAV documentation required',
          time: de ? 'Sofort' : 'Now',
          read: false,
          navTo: 'participants',
        });
      }

      // ---- Trainer qualifications ----
      const badTrainers = (Array.isArray(trainers) ? trainers : []).filter((t) => t.qualificationStatus !== 'complete');
      if (badTrainers.length > 0) {
        list.push({
          id: 'trainers', type: 'warning',
          icon: <GraduationCap size={15} />,
          title: de ? `${badTrainers.length} Trainer unvollständig` : `${badTrainers.length} trainer(s) incomplete`,
          detail: badTrainers.map((t) => t.name).join(', '),
          time: de ? 'Prüfen' : 'Review',
          read: false,
          navTo: 'trainers',
        });
      }

      // ---- Open CAPA ----
      const openCapa   = (Array.isArray(capa) ? capa : []).filter((c) => c.status === 'open' || c.status === 'overdue');
      const overdueCapa = openCapa.filter((c) => c.status === 'overdue').length;
      if (openCapa.length > 0) {
        list.push({
          id: 'capa', type: overdueCapa > 0 ? 'error' : 'warning',
          icon: <AlertTriangle size={15} />,
          title: de ? `${openCapa.length} offene CAPA-Fälle` : `${openCapa.length} open CAPA cases`,
          detail: overdueCapa > 0 ? (de ? `${overdueCapa} überfällig!` : `${overdueCapa} overdue!`) : (de ? 'Bearbeitung ausstehend' : 'Action pending'),
          time: 'QM',
          read: false,
          navTo: 'qm',
        });
      }

      // ---- Overdue equipment ----
      const overdueLoans = (Array.isArray(loans) ? loans : []).filter((eq) => {
        if (eq.returned || !eq.returnDate) return false;
        try {
          const [d, m, y] = eq.returnDate.split('.').map(Number);
          return new Date(y, m - 1, d).getTime() < now;
        } catch { return false; }
      });
      if (overdueLoans.length > 0) {
        list.push({
          id: 'loans', type: 'warning',
          icon: <Laptop size={15} />,
          title: de ? `${overdueLoans.length} Gerät(e) überfällig` : `${overdueLoans.length} device(s) overdue`,
          detail: overdueLoans.map((eq) => eq.deviceName).join(', '),
          time: de ? 'Rückgabe' : 'Return',
          read: false,
          navTo: 'participants',
        });
      }

      // ---- Missing docs ----
      const missing = (Array.isArray(docs) ? docs : []).filter((d) => d.status === 'doc_missing').length;
      if (missing > 0) {
        list.push({
          id: 'docs', type: 'info',
          icon: <FileText size={15} />,
          title: de ? `${missing} fehlende Dokumente` : `${missing} missing documents`,
          detail: de ? 'Teilnehmerakten unvollständig' : 'Participant files incomplete',
          time: de ? 'Dokumente' : 'Docs',
          read: false,
          navTo: 'docs',
        });
      }

      // ---- Upcoming audit ----
      if (TRAEGER.nextAudit) {
        try {
          const [d, m, y] = TRAEGER.nextAudit.split('.').map(Number);
          const days = Math.ceil((new Date(y, m - 1, d).getTime() - now) / 86400000);
          if (days >= 0 && days <= 60) {
            list.push({
              id: 'audit', type: days <= 14 ? 'error' : 'info',
              icon: <BadgeCheck size={15} />,
              title: de ? `Audit in ${days} Tagen` : `Audit in ${days} days`,
              detail: de ? `Nächstes Audit: ${TRAEGER.nextAudit}` : `Next audit: ${TRAEGER.nextAudit}`,
              time: 'Audit',
              read: false,
              navTo: 'audit',
            });
          }
        } catch { /* skip */ }
      }

      // ---- All good ----
      if (list.length === 0) {
        list.push({
          id: 'ok', type: 'success',
          icon: <CheckCircle2 size={15} />,
          title: de ? 'Alles in Ordnung ✅' : 'All good ✅',
          detail: de ? 'Keine offenen Aktionspunkte.' : 'No open action items.',
          time: de ? 'Jetzt' : 'Now',
          read: true,
        });
      }

      setNotifs(list);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const unread = notifs.filter((n) => !n.read).length;

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && notifs.length === 0) loadNotifs();
  };

  const markAllRead = () => setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));
  const dismiss     = (id: string, e: React.MouseEvent) => { e.stopPropagation(); setNotifs((ns) => ns.filter((n) => n.id !== id)); };

  const handleClick = (n: Notif) => {
    if (n.navTo && setView) {
      setView(n.navTo);
      setOpen(false);
      setNotifs((ns) => ns.map((x) => x.id === n.id ? { ...x, read: true } : x));
    }
  };

  const typeColor = (type: string) =>
    type === 'error' ? C.rose : type === 'warning' ? C.amber : type === 'success' ? C.mint : C.iris;

  return (
    <header className="topbar">
      <div>
        <h1 className="page-title">{titleRow[0]}</h1>
        <div className="page-sub">{titleRow[1]}</div>
      </div>

      <div className="spacer" />

      {/* Language toggle */}
      <div className="lang">
        <button className={lang === 'de' ? 'on' : ''} onClick={() => setLang('de')}>DE</button>
        <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
      </div>

      {/* AI assistant */}
      <button className="ai-trigger hide-mobile" onClick={() => setAiOpen(true)}>
        <Sparkles size={15} /> {t('assistant')}
      </button>

      {/* Tenant chip */}
      <div className="tenant-chip hide-mobile">
        <Building2 size={18} color={C.iris} />
        <div>
          <div className="tenant-name">{org}</div>
          <div className="tenant-cert"><BadgeCheck size={11} /> {t('valid_until')} {TRAEGER.validUntil}</div>
        </div>
      </div>

      {/* ===== NOTIFICATION BELL ===== */}
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          className="icon-btn"
          aria-label="alerts"
          onClick={handleOpen}
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              width: 8, height: 8, borderRadius: '50%',
              background: C.rose, border: '2px solid #fff',
            }} />
          )}
        </button>

        {/* ===== DROPDOWN ===== */}
        {open && (
          <div style={{
            position: 'absolute', top: 44, right: 0,
            width: 340, maxHeight: 480,
            background: '#fff', borderRadius: 14,
            boxShadow: '0 8px 32px rgba(15,18,40,.18)',
            border: `1px solid ${C.line}`,
            zIndex: 999, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 10px', borderBottom: `1px solid ${C.lineSoft}` }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {de ? 'Benachrichtigungen' : 'Notifications'}
                {unread > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: C.rose + '18', color: C.rose }}>
                    {unread}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {unread > 0 && (
                  <button onClick={markAllRead}
                    style={{ fontSize: 11.5, color: C.iris, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    {de ? 'Alle gelesen' : 'Mark all read'}
                  </button>
                )}
                <button onClick={loadNotifs}
                  style={{ fontSize: 14, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>
                  ↻
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loading && (
                <div style={{ padding: 24, textAlign: 'center', color: C.muted, fontSize: 13 }}>…</div>
              )}

              {!loading && notifs.map((n) => {
                const color = typeColor(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 16px',
                      background: n.read ? '#fff' : color + '05',
                      borderBottom: `1px solid ${C.lineSoft}`,
                      cursor: n.navTo ? 'pointer' : 'default',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={(e) => { if (n.navTo) e.currentTarget.style.background = color + '0D'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = n.read ? '#fff' : color + '05'; }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      background: color + '18', color,
                      display: 'grid', placeItems: 'center',
                    }}>
                      {n.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: n.read ? C.inkSoft : '#1E293B' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>
                        {n.detail}
                      </div>
                      <div style={{ fontSize: 10.5, color, marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {n.time}
                        {n.navTo && (
                          <span style={{ fontSize: 10, color: C.muted }}>
                            · {de ? 'Tippen zum Öffnen' : 'Tap to open'} →
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow / Dismiss */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {n.navTo && (
                        <ChevronRight size={14} color={C.muted} />
                      )}
                      {n.id !== 'ok' && (
                        <button
                          onClick={(e) => dismiss(n.id, e)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 2 }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            {!loading && notifs.length > 0 && notifs[0].id !== 'ok' && (
              <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.lineSoft}`, display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => { setNotifs([]); loadNotifs(); }}
                  style={{ fontSize: 12, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {de ? 'Alle verwerfen' : 'Dismiss all'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
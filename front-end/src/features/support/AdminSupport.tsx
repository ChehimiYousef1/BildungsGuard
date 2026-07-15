import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Search, Filter, Send, X, Clock, CheckCircle2, AlertCircle, XCircle, User, ChevronRight, Paperclip } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { Avatar } from '../../components/Avatar';

const STATUS_MAP: Record<string, { de: string; en: string; color: string; icon: React.ReactNode }> = {
  open:        { de: 'Offen',        en: 'Open',        color: C.iris,  icon: <Clock size={12} /> },
  in_progress: { de: 'In Bearbeitung', en: 'In Progress', color: C.amber, icon: <AlertCircle size={12} /> },
  resolved:    { de: 'Gelöst',       en: 'Resolved',    color: C.mint,  icon: <CheckCircle2 size={12} /> },
  closed:      { de: 'Geschlossen',  en: 'Closed',      color: C.muted, icon: <XCircle size={12} /> },
};

const TYPE_MAP: Record<string, { de: string; en: string }> = {
  technical:   { de: 'Technisches Problem', en: 'Technical Issue' },
  course:      { de: 'Kursproblem',          en: 'Course Issue' },
  trainer:     { de: 'Trainerproblem',       en: 'Trainer Issue' },
  suggestion:  { de: 'Vorschlag/Feedback',   en: 'Suggestion / Feedback' },
  upload:      { de: 'Upload-Problem',        en: 'Upload Issue' },
  system:      { de: 'Systemproblem',         en: 'System Problem' },
  other:       { de: 'Sonstiges',             en: 'Other' },
};

export default function AdminSupport() {
  const { lang } = useApp();
  const de = lang === 'de';
  const [tickets, setTickets]   = useState<any[]>([]);
  const [sel, setSel]           = useState<any | null>(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]     = useState('');
  const [reply, setReply]       = useState('');
  const [sending, setSending]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterType)   params.set('type', filterType);
      if (search)       params.set('search', search);
      const data = await api<any[]>(`/support?${params}`).catch(() => []);
      setTickets(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus, filterType]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [sel?.messages]);

  const openTicket = async (t: any) => {
    const full = await api<any>(`/support/${t.id}`).catch(() => t);
    setSel(full);
  };

  const sendReply = async () => {
    if (!reply.trim() || !sel) return;
    setSending(true);
    try {
      const msg = await api(`/support/${sel.id}/messages`, { method: 'POST', body: JSON.stringify({ content: reply }) });
      setSel((s: any) => ({ ...s, messages: [...(s.messages ?? []), msg] }));
      setReply('');
    } finally { setSending(false); }
  };

  const changeStatus = async (status: string) => {
    if (!sel) return;
    await api(`/support/${sel.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    setSel((s: any) => ({ ...s, status }));
    setTickets(ts => ts.map(t => t.id === sel.id ? { ...t, status } : t));
  };

  const filtered = tickets.filter(t =>
    !search || t.subject?.toLowerCase().includes(search.toLowerCase()) || t.userName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 16, padding: '0 0 16px' }}>

      {/* ===== LEFT: TICKET LIST ===== */}
      <div className="card" style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="card-head" style={{ padding: '14px 14px 10px' }}>
          <div className="card-title">
            <MessageSquare size={15} color={C.iris} style={{ marginRight: 6 }} />
            {de ? 'Support-Tickets' : 'Support Tickets'}
            <span style={{ marginLeft: 6, fontSize: 11, background: C.iris + '18', color: C.iris, borderRadius: 20, padding: '1px 7px' }}>
              {filtered.length}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '0 12px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              placeholder={de ? 'Suchen...' : 'Search...'}
              style={{ width: '100%', padding: '7px 9px 7px 28px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12.5, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              style={{ flex: 1, padding: '6px 8px', borderRadius: 7, border: '1px solid #E2E8F0', fontSize: 12, outline: 'none' }}>
              <option value="">{de ? 'Alle Status' : 'All Status'}</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{de ? v.de : v.en}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              style={{ flex: 1, padding: '6px 8px', borderRadius: 7, border: '1px solid #E2E8F0', fontSize: 12, outline: 'none' }}>
              <option value="">{de ? 'Alle Typen' : 'All Types'}</option>
              {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{de ? v.de : v.en}</option>)}
            </select>
          </div>
        </div>

        {/* Ticket list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && <div style={{ padding: 16, color: C.muted, fontSize: 13 }}>…</div>}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: 16, color: C.muted, fontSize: 13 }}>{de ? 'Keine Tickets.' : 'No tickets.'}</div>
          )}
          {filtered.map((t) => {
            const st = STATUS_MAP[t.status] ?? STATUS_MAP.open;
            const isActive = sel?.id === t.id;
            return (
              <div key={t.id} onClick={() => openTicket(t)}
                style={{ padding: '11px 14px', borderBottom: `1px solid ${C.lineSoft}`, cursor: 'pointer',
                  background: isActive ? C.iris + '08' : 'transparent',
                  borderLeft: isActive ? `3px solid ${C.iris}` : '3px solid transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: st.color + '18', color: st.color, flexShrink: 0 }}>
                    {de ? st.de : st.en}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, display: 'flex', gap: 8 }}>
                  <span>{t.userName}</span>
                  <span>·</span>
                  <span style={{ textTransform: 'capitalize' }}>{t.userRole}</span>
                  <span>·</span>
                  <span>{TYPE_MAP[t.type]?.[lang as 'de'|'en'] ?? t.type}</span>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                  {t.messages?.length ?? 0} {de ? 'Nachrichten' : 'messages'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== RIGHT: CONVERSATION ===== */}
      {sel ? (
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{sel.subject}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {sel.userName} · {sel.userRole} · {TYPE_MAP[sel.type]?.[lang as 'de'|'en'] ?? sel.type}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={sel.status} onChange={(e) => changeStatus(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${C.line}`, fontSize: 12.5, outline: 'none', cursor: 'pointer' }}>
                {Object.entries(STATUS_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{de ? v.de : v.en}</option>
                ))}
              </select>
              <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(sel.messages ?? []).map((msg: any, i: number) => {
              const isAdmin = msg.senderRole === 'admin' || msg.senderRole === 'verwaltung';
              return (
                <div key={msg.id ?? i} style={{ display: 'flex', gap: 10, flexDirection: isAdmin ? 'row-reverse' : 'row' }}>
                  <Avatar n={msg.senderName} size={32} />
                  <div style={{ maxWidth: '70%' }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 3, textAlign: isAdmin ? 'right' : 'left' }}>
                      {msg.senderName} · {new Date(msg.createdAt).toLocaleString(de ? 'de-DE' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.5,
                      background: isAdmin ? C.iris : '#F1F5F9',
                      color: isAdmin ? '#fff' : '#1E293B',
                      borderBottomRightRadius: isAdmin ? 4 : 12,
                      borderBottomLeftRadius: isAdmin ? 12 : 4 }}>
                      {msg.content}
                    </div>
                    {msg.fileRef && (
                      <a href={msg.fileRef} target="_blank" rel="noreferrer"
                        style={{ fontSize: 11, color: C.iris, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <Paperclip size={11} /> {de ? 'Anhang' : 'Attachment'}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Reply box */}
          <div style={{ padding: '12px 18px', borderTop: `1px solid ${C.line}`, display: 'flex', gap: 10 }}>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              placeholder={de ? 'Antwort schreiben... (Enter zum Senden)' : 'Write a reply... (Enter to send)'}
              rows={2} style={{ flex: 1, padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13, outline: 'none', resize: 'none' }} />
            <button onClick={sendReply} disabled={!reply.trim() || sending}
              className="btn btn-primary" style={{ padding: '0 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Send size={14} /> {de ? 'Senden' : 'Send'}
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: C.muted }}>
          <MessageSquare size={40} color={C.line} />
          <div style={{ fontSize: 14 }}>{de ? 'Ticket auswählen' : 'Select a ticket'}</div>
        </div>
      )}
    </div>
  );
}
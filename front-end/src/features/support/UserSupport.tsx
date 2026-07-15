import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Send, X, Clock, CheckCircle2, AlertCircle, XCircle, ChevronLeft, Paperclip } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { Avatar } from '../../components/Avatar';

const STATUS_MAP: Record<string, { de: string; en: string; color: string }> = {
  open:        { de: 'Offen',          en: 'Open',        color: C.iris  },
  in_progress: { de: 'In Bearbeitung', en: 'In Progress', color: C.amber },
  resolved:    { de: 'Gelöst',         en: 'Resolved',    color: C.mint  },
  closed:      { de: 'Geschlossen',    en: 'Closed',      color: C.muted },
};

const TYPES_TRAINER = [
  { value: 'upload',    de: 'Upload-Problem',      en: 'Upload Issue' },
  { value: 'course',   de: 'Kurs-Problem',         en: 'Course Issue' },
  { value: 'system',   de: 'Systemproblem',        en: 'System Problem' },
  { value: 'suggestion', de: 'Vorschlag/Feedback', en: 'Suggestion / Feedback' },
  { value: 'other',    de: 'Sonstiges',            en: 'Other' },
];

const TYPES_PART = [
  { value: 'technical', de: 'Technisches Problem', en: 'Technical Issue' },
  { value: 'course',    de: 'Kursproblem',          en: 'Course Issue' },
  { value: 'trainer',   de: 'Trainerproblem',       en: 'Trainer Issue' },
  { value: 'suggestion', de: 'Vorschlag/Feedback',  en: 'Suggestion / Feedback' },
  { value: 'other',     de: 'Sonstiges',            en: 'Other' },
];

export default function UserSupport({ role }: { role: 'trainer' | 'participant' }) {
  const { lang } = useApp();
  const de = lang === 'de';
  const types = role === 'trainer' ? TYPES_TRAINER : TYPES_PART;

  const [tickets, setTickets]     = useState<any[]>([]);
  const [sel, setSel]             = useState<any | null>(null);
  const [loading, setLoading]     = useState(true);
  const [showNew, setShowNew]     = useState(false);
  const [reply, setReply]         = useState('');
  const [sending, setSending]     = useState(false);
  const [form, setForm]           = useState({ subject: '', type: types[0].value, message: '' });
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api<any[]>('/support').catch(() => []);
      setTickets(Array.isArray(data) ? data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [sel?.messages]);

  const openTicket = async (t: any) => {
    const full = await api<any>(`/support/${t.id}`).catch(() => t);
    setSel(full);
    setShowNew(false);
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

  const submitTicket = async () => {
    if (!form.subject || !form.message) return;
    setSubmitting(true);
    try {
      const ticket = await api('/support', { method: 'POST', body: JSON.stringify(form) });
      setTickets(ts => [ticket, ...ts]);
      setSel(ticket);
      setShowNew(false);
      setForm({ subject: '', type: types[0].value, message: '' });
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 16, padding: '0 0 16px' }}>

      {/* ===== LEFT: LIST ===== */}
      <div className="card" style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="card-head" style={{ padding: '14px 14px 10px' }}>
          <div className="card-title">
            <MessageSquare size={15} color={C.iris} style={{ marginRight: 6 }} />
            {de ? 'Meine Tickets' : 'My Tickets'}
          </div>
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => { setShowNew(true); setSel(null); }}>
            <Plus size={13} /> {de ? 'Neu' : 'New'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && <div style={{ padding: 16, color: C.muted, fontSize: 13 }}>…</div>}
          {!loading && tickets.length === 0 && (
            <div style={{ padding: 16, color: C.muted, fontSize: 13, textAlign: 'center' }}>
              <MessageSquare size={24} color={C.line} style={{ marginBottom: 8 }} />
              <div>{de ? 'Noch keine Tickets.' : 'No tickets yet.'}</div>
              <button className="btn btn-ghost" style={{ marginTop: 8, fontSize: 12 }} onClick={() => setShowNew(true)}>
                {de ? 'Erstes Ticket erstellen' : 'Create first ticket'}
              </button>
            </div>
          )}
          {tickets.map((t) => {
            const st = STATUS_MAP[t.status] ?? STATUS_MAP.open;
            const isActive = sel?.id === t.id;
            return (
              <div key={t.id} onClick={() => openTicket(t)}
                style={{ padding: '11px 14px', borderBottom: `1px solid ${C.lineSoft}`, cursor: 'pointer',
                  background: isActive ? C.iris + '08' : 'transparent',
                  borderLeft: isActive ? `3px solid ${C.iris}` : '3px solid transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{t.subject}</div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: st.color + '18', color: st.color, flexShrink: 0 }}>
                    {de ? st.de : st.en}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                  {t.messages?.length ?? 0} {de ? 'Nachrichten' : 'messages'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== RIGHT: NEW TICKET or CONVERSATION ===== */}
      {showNew ? (
        <div className="card" style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{de ? 'Neues Ticket' : 'New Ticket'}</div>
            <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
              <X size={18} />
            </button>
          </div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {de ? 'Typ' : 'Type'}
            <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
              style={{ padding: '9px 11px', borderRadius: 9, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' }}>
              {types.map(t => <option key={t.value} value={t.value}>{de ? t.de : t.en}</option>)}
            </select>
          </label>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'flex', flexDirection: 'column', gap: 5 }}>
            {de ? 'Betreff' : 'Subject'}
            <input value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder={de ? 'Kurze Beschreibung...' : 'Short description...'}
              style={{ padding: '9px 11px', borderRadius: 9, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' }} />
          </label>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
            {de ? 'Nachricht' : 'Message'}
            <textarea value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder={de ? 'Beschreiben Sie Ihr Anliegen...' : 'Describe your issue...'}
              style={{ flex: 1, padding: '9px 11px', borderRadius: 9, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', resize: 'none', minHeight: 120 }} />
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setShowNew(false)}>{de ? 'Abbrechen' : 'Cancel'}</button>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              disabled={!form.subject || !form.message || submitting} onClick={submitTicket}>
              <Send size={14} /> {submitting ? '…' : (de ? 'Absenden' : 'Submit')}
            </button>
          </div>
        </div>
      ) : sel ? (
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{sel.subject}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center' }}>
                {(() => { const st = STATUS_MAP[sel.status] ?? STATUS_MAP.open; return (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: st.color + '18', color: st.color }}>
                    {de ? st.de : st.en}
                  </span>
                ); })()}
                <span style={{ fontSize: 11, color: C.muted }}>{sel.messages?.length ?? 0} {de ? 'Nachrichten' : 'messages'}</span>
              </div>
            </div>
            <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
              <X size={18} />
            </button>
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
                      {isAdmin ? (de ? 'Support-Team' : 'Support Team') : msg.senderName}
                      {' · '}{new Date(msg.createdAt).toLocaleString(de ? 'de-DE' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.5,
                      background: isAdmin ? C.iris : '#F1F5F9',
                      color: isAdmin ? '#fff' : '#1E293B',
                      borderBottomRightRadius: isAdmin ? 4 : 12,
                      borderBottomLeftRadius: isAdmin ? 12 : 4 }}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Reply */}
          {sel.status !== 'closed' && (
            <div style={{ padding: '12px 18px', borderTop: `1px solid ${C.line}`, display: 'flex', gap: 10 }}>
              <textarea value={reply} onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                placeholder={de ? 'Antwort schreiben...' : 'Write a reply...'}
                rows={2} style={{ flex: 1, padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13, outline: 'none', resize: 'none' }} />
              <button onClick={sendReply} disabled={!reply.trim() || sending}
                className="btn btn-primary" style={{ padding: '0 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: C.muted }}>
          <MessageSquare size={40} color={C.line} />
          <div style={{ fontSize: 14 }}>{de ? 'Ticket auswählen oder neu erstellen' : 'Select or create a ticket'}</div>
          <button className="btn btn-primary" onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> {de ? 'Neues Ticket' : 'New Ticket'}
          </button>
        </div>
      )}
    </div>
  );
}
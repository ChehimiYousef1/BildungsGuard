import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Mail, Phone, FileText } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';

export default function SupportView() {
  const { lang } = useApp();
  const de = lang === 'de';
  const [form, setForm] = useState({ subject: '', message: '', type: 'bug' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!form.subject || !form.message) return;
    setSending(true);
    try {
      await api('/support', { method: 'POST', body: JSON.stringify(form) }).catch(() => {});
      setSent(true);
    } finally { setSending(false); }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="card" style={{ padding: 24 }}>
        <div className="card-title" style={{ marginBottom: 16, fontSize: 17 }}>
          <MessageSquare size={17} color={C.iris} style={{ marginRight: 8 }} />
          {de ? 'Support & Feedback' : 'Support & Feedback'}
        </div>

        {sent ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0' }}>
            <CheckCircle2 size={40} color={C.mint} />
            <div style={{ fontSize: 15, fontWeight: 600 }}>{de ? 'Nachricht gesendet!' : 'Message sent!'}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{de ? 'Wir melden uns so schnell wie möglich.' : 'We will get back to you as soon as possible.'}</div>
            <button className="btn btn-ghost" onClick={() => { setSent(false); setForm({ subject: '', message: '', type: 'bug' }); }}>
              {de ? 'Neue Nachricht' : 'New message'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {de ? 'Typ' : 'Type'}
              <select value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                style={{ padding: '9px 11px', borderRadius: 9, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' }}>
                <option value="bug">{de ? 'Fehler melden' : 'Report a bug'}</option>
                <option value="feature">{de ? 'Funktionswunsch' : 'Feature request'}</option>
                <option value="question">{de ? 'Frage' : 'Question'}</option>
                <option value="other">{de ? 'Sonstiges' : 'Other'}</option>
              </select>
            </label>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {de ? 'Betreff' : 'Subject'}
              <input value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder={de ? 'Kurze Beschreibung...' : 'Short description...'}
                style={{ padding: '9px 11px', borderRadius: 9, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' }} />
            </label>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {de ? 'Nachricht' : 'Message'}
              <textarea value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder={de ? 'Beschreiben Sie Ihr Anliegen...' : 'Describe your issue...'}
                rows={5} style={{ padding: '9px 11px', borderRadius: 9, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', resize: 'vertical' }} />
            </label>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
              disabled={!form.subject || !form.message || sending} onClick={submit}>
              <Send size={14} /> {sending ? '…' : (de ? 'Senden' : 'Send')}
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{de ? 'Kontakt' : 'Contact'}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="mailto:support@omah.de" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.iris, textDecoration: 'none' }}>
            <Mail size={14} /> support@omah.de
          </a>
        </div>
      </div>
    </div>
  );
}

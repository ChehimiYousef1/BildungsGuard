import React, { useState, useEffect } from 'react';
import { translateText } from '../../lib/translateName';
import {
  Megaphone, CheckCircle2, Send, Mail, MessageSquare,
  Linkedin, Smartphone, Trash2, Pencil, Check, X, Layers
} from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/Badge';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

const CHAN_META: Record<string, { ic: any; col: string }> = {
  email:    { ic: Mail,          col: '#4E2BCD' },
  sms:      { ic: MessageSquare, col: '#16A34A' },
  linkedin: { ic: Linkedin,      col: '#0A66C2' },
  whatsapp: { ic: Smartphone,    col: '#25D366' },
};

export default function Comms() {
  const { t, lang } = useApp();
  const de = lang === 'de';

  const [campaigns,  setCampaigns]  = useState<any[]>([]);
  const [channels,   setChannels]   = useState<any[]>([]);
  const [measures,   setMeasures]   = useState<any[]>([]);
  const [seg,        setSeg]        = useState('seg_active');
  const [measureId,  setMeasureId]  = useState('');   // ← filter جديد
  const [chan,       setChan]        = useState('email');
  const [subject,    setSubject]     = useState('');
  const [body,       setBody]        = useState('');
  const [toast,      setToast]       = useState('');
  const [sending,    setSending]     = useState(false);
  const [pickOpen,   setPickOpen]    = useState(false);
  const [editId,     setEditId]      = useState<string | null>(null);
  const [editName,   setEditName]    = useState('');

  const segs = ['seg_all_alumni', 'seg_alumni_emp', 'seg_alumni_seek', 'seg_active'];

  const load = async () => {
    try {
      const [camps, chans, meas] = await Promise.all([
        api<any[]>('/campaigns').catch(() => []),
        api<any[]>('/campaigns/channels').catch(() => []),
        api<any[]>('/measures').catch(() => []),
      ]);
      setCampaigns(Array.isArray(camps) ? camps : []);
      setChannels(Array.isArray(chans) ? chans : []);
      setMeasures(Array.isArray(meas) ? meas : []);
    } catch { /* ignore */ }
  };
  useEffect(() => { load(); }, []);

  const toggleChannel = async (id: string, connected: boolean) => {
    try {
      await api(`/campaigns/channels/${id}`, { method: 'PATCH', body: JSON.stringify({ connected: !connected }) });
      await load();
    } catch (e) { console.error('toggle channel failed', e); }
  };

  const openGmail = () => {
    const params = new URLSearchParams({ view: 'cm' });
    if (subject.trim()) params.set('su', subject);
    if (body.trim())    params.set('body', body);
    window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank', 'noopener');
  };

  const openOutlook = () => {
    const params = new URLSearchParams();
    if (subject.trim()) params.set('subject', subject);
    if (body.trim())    params.set('body', body);
    window.open(`https://outlook.live.com/mail/deeplink/compose?${params.toString()}`, '_blank', 'noopener');
  };

  const sendServer = async () => {
    setSending(true);
    try {
      const payload: any = {
        name:     subject || (de ? 'Nachricht' : 'Message'),
        audience: seg,
        channel:  chan,
        message:  body,
      };
      if (measureId) payload.measureId = measureId;

      const res = await api<any>('/campaigns/send', { method: 'POST', body: JSON.stringify(payload) });

      if (chan === 'email') {
        setToast(de
          ? `Gesendet an ${res?.sent ?? 0} von ${res?.totalRecipients ?? 0} Empfängern.`
          : `Sent to ${res?.sent ?? 0} of ${res?.totalRecipients ?? 0} recipients.`);
      } else {
        setToast(de
          ? 'Kampagne gespeichert (Kanal benötigt externe Integration).'
          : 'Campaign saved (channel needs external integration).');
      }
      setSubject(''); setBody('');
      await load();
      setTimeout(() => setToast(''), 5000);
    } catch (e) {
      setToast(de ? 'Senden fehlgeschlagen.' : 'Send failed.');
      setTimeout(() => setToast(''), 4000);
    } finally { setSending(false); }
  };

  const startEdit  = (c: any) => { setEditId(c.id); setEditName(c.name); };
  const saveEdit   = async (id: string) => {
    const name = editName.trim();
    if (!name) { setEditId(null); return; }
    try {
      await api(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
      setEditId(null); await load();
    } catch (e) { console.error(e); }
  };
  const deleteCampaign = async (id: string) => {
    if (!confirm(de ? 'Diese Kampagne löschen?' : 'Delete this campaign?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/campaigns/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      await load();
    } catch (e) { console.error(e); }
  };

  const chanLabel = (typeOrId: string) => {
    const c = channels.find((x) => x.type === typeOrId || x.id === typeOrId);
    return c ? c.name : typeOrId;
  };

  const connectedChannels = channels.filter((c) => c.connected);

  // ===== Audience label for summary =====
  const audienceSummary = () => {
    const meas = measures.find((m) => m.id === measureId);
    if (measureId && meas) return meas.name;
    if (seg === 'seg_active')      return de ? 'Aktive Teilnehmer' : 'Active participants';
    if (seg === 'seg_all_alumni')  return de ? 'Alle Alumni' : 'All alumni';
    if (seg === 'seg_alumni_emp')  return de ? 'Alumni in Beschäftigung' : 'Employed alumni';
    if (seg === 'seg_alumni_seek') return de ? 'Alumni Jobsuchend' : 'Job-seeking alumni';
    return seg;
  };

  return (
    <>
      {toast && (
        <div className="toast">
          <Megaphone size={18} color={C.mint} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontWeight: 600 }}>{toast}</div>
        </div>
      )}

      {/* ===== CHANNELS ===== */}
      <div className="card" style={{ marginBottom: 15 }}>
        <div className="card-head">
          <div className="card-title">{t('cm_channels')}</div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {channels.map((c) => {
            const meta = CHAN_META[c.type] ?? { ic: Megaphone, col: C.iris };
            const Ic   = meta.ic;
            return (
              <div key={c.id} style={{ border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, display: 'flex', gap: 11, alignItems: 'center' }}>
                <div className="chan-ic" style={{ background: meta.col + '22', color: meta.col }}>
                  <Ic size={19} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 11.5, color: C.muted }}>
                    {c.connected ? (t('cm_connected') + (c.reach ? ` · ${c.reach}` : '')) : t('cm_connect')}
                  </div>
                </div>
                {c.connected ? (
                  <button onClick={() => toggleChannel(c.id, c.connected)} title={de ? 'Trennen' : 'Disconnect'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <CheckCircle2 size={17} color={C.mint} />
                  </button>
                ) : (
                  <button className="btn btn-ghost" style={{ padding: '6px 11px', fontSize: 11.5 }}
                    onClick={() => toggleChannel(c.id, c.connected)}>
                    {t('cm_connect')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== CAMPAIGNS + COMPOSE ===== */}
      <div className="grid" style={{ gridTemplateColumns: '1.25fr 1fr' }}>

        {/* Campaigns table */}
        <div className="card" style={{ padding: '19px 8px 8px' }}>
          <div className="card-head" style={{ padding: '0 13px' }}>
            <div className="card-title">{t('cm_campaigns')} · {campaigns.length}</div>
          </div>
          {campaigns.length === 0 ? (
            <div style={{ padding: 16, color: C.muted, fontSize: 13 }}>
              {de ? 'Noch keine Kampagnen.' : 'No campaigns yet.'}
            </div>
          ) : (
            <div className="scroll-x">
              <table>
                <thead>
                  <tr>
                    <th>{de ? 'Kampagne' : 'Campaign'}</th>
                    <th className="hide-mobile">{t('col_audience')}</th>
                    <th>{t('col_channel')}</th>
                    <th style={{ textAlign: 'center' }}>{t('col_reach')}</th>
                    <th className="hide-mobile">{t('col_openrate')}</th>
                    <th>{t('col_status')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c, i) => (
                    <tr key={c.id ?? i} className="row">
                      <td className="cell-name">
                        {editId === c.id ? (
                          <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(c.id); if (e.key === 'Escape') setEditId(null); }}
                            style={{ padding: '4px 8px', borderRadius: 7, border: `1px solid ${C.iris}`, fontSize: 12.5, outline: 'none', width: '90%' }} />
                        ) : (c.name ?? '—')}
                      </td>
                      <td className="hide-mobile" style={{ fontSize: 12 }}>{c.audience ? t(c.audience) : '—'}</td>
                      <td>{chanLabel(c.channel)}</td>
                      <td className="mono" style={{ textAlign: 'center' }}>{c.reach || '—'}</td>
                      <td className="hide-mobile mono" style={{ color: C.muted }}>{c.openRate ?? '—'}</td>
                      <td><Badge s={c.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          {editId === c.id ? (
                            <>
                              <button onClick={() => saveEdit(c.id)} style={iconBtn}><Check size={14} color={C.mint} /></button>
                              <button onClick={() => setEditId(null)} style={iconBtn}><X size={14} color={C.muted} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(c)} title={de ? 'Umbenennen' : 'Rename'} style={iconBtn}><Pencil size={13} color={C.muted} /></button>
                              <button onClick={() => deleteCampaign(c.id)} title={de ? 'Löschen' : 'Delete'} style={iconBtn}><Trash2 size={13} color={C.muted} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Compose */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">{t('cm_compose')}</div>
            <Megaphone size={17} color={C.iris} />
          </div>

          {/* ===== BOOTCAMP FILTER ===== */}
          <div style={{ fontSize: 11.5, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>
            <Layers size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {de ? 'Bootcamp' : 'Bootcamp'}
          </div>
          <div style={{ marginBottom: 13 }}>
            <select
              value={measureId}
              onChange={(e) => setMeasureId(e.target.value)}
              style={{
                width: '100%', padding: '8px 11px', borderRadius: 9, fontSize: 12.5,
                border: `1.5px solid ${measureId ? C.iris : C.line}`,
                outline: 'none', cursor: 'pointer', background: '#fff',
                color: measureId ? C.iris : C.muted, fontWeight: measureId ? 600 : 400,
              }}
            >
              <option value="">{de ? '— Alle Bootcamps —' : '— All Bootcamps —'}</option>
              <option value="none">{de ? '— Kein Bootcamp (Alumni) —' : '— No Bootcamp (Alumni) —'}</option>
              {measures.map((m) => (
                <option key={m.id} value={m.id}>
                  {translateText(m.name, lang)}{m.number ? ` (Nr. ${m.number})` : ''}
                </option>
              ))}
            </select>
            {measureId && measureId !== 'none' && (
              <div style={{ marginTop: 6, padding: '5px 10px', borderRadius: 7, background: C.iris + '10', fontSize: 11.5, color: C.iris, fontWeight: 600 }}>
                {de ? 'Filter aktiv:' : 'Filter active:'} {measures.find((m) => m.id === measureId)?.name}
              </div>
            )}
            {measureId === 'none' && (
              <div style={{ marginTop: 6, padding: '5px 10px', borderRadius: 7, background: C.amber + '10', fontSize: 11.5, color: C.amber, fontWeight: 600 }}>
                {de ? 'Nur Teilnehmer ohne Bootcamp (Alumni)' : 'Only participants without bootcamp (Alumni)'}
              </div>
            )}
          </div>

          {/* Audience */}
          <div style={{ fontSize: 11.5, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>{t('cm_to')}</div>
          <div className="seg" style={{ flexWrap: 'wrap', marginBottom: 13 }}>
            {segs.map((s) => (
              <button key={s} className={seg === s ? 'p' : ''} onClick={() => setSeg(s)} style={{ fontSize: 11 }}>
                {t(s)}
              </button>
            ))}
          </div>

          {/* Channel */}
          <div style={{ fontSize: 11.5, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>{t('cm_via')}</div>
          <div className="seg" style={{ marginBottom: 13, flexWrap: 'wrap' }}>
            {connectedChannels.length === 0
              ? <span style={{ fontSize: 11.5, color: C.mutedLight, padding: '4px 0' }}>
                  {de ? 'Keine Kanäle verbunden' : 'No channels connected'}
                </span>
              : connectedChannels.map((c) => (
                  <button key={c.id} className={chan === c.type ? 'p' : ''} onClick={() => setChan(c.type)} style={{ fontSize: 11 }}>
                    {c.name}
                  </button>
                ))}
          </div>

          {chan !== 'email' && connectedChannels.some((c) => c.type === chan) && (
            <div style={{ fontSize: 11, color: C.amber, marginBottom: 10, background: C.amber + '15', borderRadius: 8, padding: '7px 10px' }}>
              ⚠️ {de
                ? 'Dieser Kanal benötigt eine externe Integration — wird nur gespeichert.'
                : 'This channel needs external integration — saved only.'}
            </div>
          )}

          {/* Audience summary */}
          <div style={{ marginBottom: 10, padding: '6px 10px', borderRadius: 8, background: C.soft, fontSize: 12, color: C.inkSoft, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Megaphone size={12} color={C.iris} />
            {de ? 'Empfänger:' : 'Recipients:'} <strong style={{ color: C.iris }}>{audienceSummary()}</strong>
          </div>

          <input className="input" style={{ width: '100%', marginBottom: 10 }}
            placeholder={t('cm_subject')} value={subject}
            onChange={(e) => setSubject(e.target.value)} />

          <textarea className="input" style={{ width: '100%', minHeight: 84, resize: 'vertical', marginBottom: 12 }}
            placeholder={t('cm_message')} value={body}
            onChange={(e) => setBody(e.target.value)} />

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
            disabled={sending}
            onClick={() => { if (!subject.trim() && !body.trim()) return; setPickOpen(true); }}>
            <Send size={15} /> {sending ? '…' : t('cm_send')}
          </button>
        </div>
      </div>

      {/* ===== PICK MODAL ===== */}
      {pickOpen && (
        <div onClick={() => setPickOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16,
        }}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 340, padding: 22 }}>

            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
              {de ? 'Wohin senden?' : 'Send via…'}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>
              {de ? 'Empfänger:' : 'Recipients:'} <strong style={{ color: C.iris }}>{audienceSummary()}</strong>
            </div>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 18 }}>
              {de ? 'Wähle den E-Mail-Anbieter' : 'Choose your email provider'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* System email */}
              <button disabled={sending}
                onClick={() => { setPickOpen(false); sendServer(); }}
                style={{ padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${C.iris}`, background: C.iris + '08', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: C.iris, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Mail size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.iris }}>{de ? 'System-E-Mail' : 'System email'}</div>
                  <div style={{ fontSize: 11.5, color: C.muted }}>{de ? 'Direkt vom Server senden' : 'Send directly from server'}</div>
                </div>
              </button>

              {/* Gmail */}
              <button onClick={() => { setPickOpen(false); openGmail(); }}
                style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid #EA4335', background: '#EA433508', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: '#EA4335', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4.5" width="20" height="15" rx="2" fill="#fff"/>
                    <path d="M2 6.5l10 7 10-7" stroke="#EA4335" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    <path d="M2 7v11.5h20V7" stroke="#EA4335" strokeWidth=".5" fill="none"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#EA4335' }}>Gmail</div>
                  <div style={{ fontSize: 11.5, color: C.muted }}>@gmail.com</div>
                </div>
              </button>

              {/* Outlook */}
              <button onClick={() => { setPickOpen(false); openOutlook(); }}
                style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid #0078D4', background: '#0078D408', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: '#0078D4', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2" fill="#0078D4"/>
                    <rect x="2" y="4" width="11" height="16" rx="2" fill="#0364B8"/>
                    <ellipse cx="7.5" cy="12" rx="2.5" ry="3" fill="white"/>
                    <rect x="13" y="8.5" width="6" height="1.5" rx=".75" fill="#9DC6F7"/>
                    <rect x="13" y="11.25" width="6" height="1.5" rx=".75" fill="#9DC6F7"/>
                    <rect x="13" y="14" width="4" height="1.5" rx=".75" fill="#9DC6F7"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0078D4' }}>Outlook</div>
                  <div style={{ fontSize: 11.5, color: C.muted }}>@outlook.com · @hotmail.com</div>
                </div>
              </button>

            </div>

            <button onClick={() => setPickOpen(false)}
              style={{ marginTop: 14, width: '100%', padding: '9px', borderRadius: 9, border: `1px solid ${C.line}`, background: C.soft, cursor: 'pointer', fontSize: 12.5, color: C.inkSoft }}>
              {de ? 'Abbrechen' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 3, display: 'grid', placeItems: 'center',
};



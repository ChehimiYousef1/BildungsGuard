import React, { useState, useEffect } from 'react';
import { translateText } from '../../lib/translateName';
import {
  Megaphone, CheckCircle2, Send, Mail, MessageSquare,
  Linkedin, Smartphone, Trash2, Pencil, Check, X,
  Layers, Users, Filter, Eye
} from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/Badge';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000/api/v1';

const CHAN_META: Record<string, { ic: any; col: string }> = {
  email:    { ic: Mail,          col: '#4E2BCD' },
  sms:      { ic: MessageSquare, col: '#16A34A' },
  linkedin: { ic: Linkedin,      col: '#0A66C2' },
  whatsapp: { ic: Smartphone,    col: '#25D366' },
};

const STAGES = [
  { value: '',              de: '— Alle Phasen —',        en: '— All Stages —' },
  { value: 'onboarding',   de: 'Onboarding (Kursstart)',  en: 'Onboarding (course start)' },
  { value: 'in_progress',  de: 'In Durchführung',         en: 'In Progress' },
  { value: 'final_exam',   de: 'Abschlussprüfung',        en: 'Final Exam' },
  { value: 'graduated_1m', de: 'Abschluss — 1 Monat',    en: 'Graduated — 1 Month' },
  { value: 'graduated_3m', de: 'Abschluss — 3 Monate',   en: 'Graduated — 3 Months' },
  { value: 'graduated_6m', de: 'Abschluss — 6 Monate',   en: 'Graduated — 6 Months' },
];

const GmailSvg = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4.5" width="20" height="15" rx="2" fill="#fff" stroke="#ddd" strokeWidth=".5"/>
    <path d="M2 6.5l10 7 10-7" stroke="#EA4335" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

const OutlookSvg = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" fill="#0078D4"/>
    <rect x="2" y="4" width="11" height="16" rx="2" fill="#0364B8"/>
    <ellipse cx="7.5" cy="12" rx="2.5" ry="3" fill="white"/>
    <rect x="13" y="8.5" width="6" height="1.5" rx=".75" fill="#9DC6F7"/>
    <rect x="13" y="11.25" width="6" height="1.5" rx=".75" fill="#9DC6F7"/>
    <rect x="13" y="14" width="4" height="1.5" rx=".75" fill="#9DC6F7"/>
  </svg>
);

export default function Comms() {
  const { t, lang, toast } = useApp();
  const de = lang === 'de';

  const [campaigns,  setCampaigns]  = useState<any[]>([]);
  const [channels,   setChannels]   = useState<any[]>([]);
  const [measures,   setMeasures]   = useState<any[]>([]);

  // Compose state
  const [seg,       setSeg]       = useState('seg_active');
  const [measureId, setMeasureId] = useState('');
  const [stage,     setStage]     = useState('');
  const [chan,      setChan]       = useState('email');
  const [subject,   setSubject]   = useState('');
  const [body,      setBody]      = useState('');

  // Preview recipients
  const [preview,         setPreview]         = useState<{ total: number; recipients: any[] } | null>(null);
  const [previewing,      setPreviewing]       = useState(false);
  const [previewOpen,     setPreviewOpen]      = useState(false);

  const [sending,   setSending]   = useState(false);
  const [pickOpen,  setPickOpen]  = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [editName,  setEditName]  = useState('');

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
    } catch { }
  };
  useEffect(() => { load(); }, []);

  // Preview recipients when filters change
  useEffect(() => {
    setPreview(null);
  }, [seg, measureId, stage]);

  const toggleChannel = async (id: string, connected: boolean) => {
    try {
      await api(`/campaigns/channels/${id}`, { method: 'PATCH', body: JSON.stringify({ connected: !connected }) });
      await load();
    } catch (e) { console.error('toggle channel failed', e); }
  };

  // ===== Preview Recipients =====
  const fetchPreview = async () => {
    setPreviewing(true);
    try {
      const res = await api<any>('/campaigns/preview-recipients', {
        method: 'POST',
        body: JSON.stringify({ audience: seg, measureId: measureId || undefined, stage: stage || undefined }),
      });
      setPreview(res);
    } catch (e) {
      console.error('preview failed', e);
      toast?.error(de ? 'Vorschau fehlgeschlagen.' : 'Preview failed.');
    } finally { setPreviewing(false); }
  };

  // ===== Gmail =====
  const openGmail = () => {
    const params = new URLSearchParams({ view: 'cm' });
    if (subject.trim()) params.set('su', subject);
    if (body.trim())    params.set('body', body);
    window.open(`https://mail.google.com/mail/?${params.toString()}`, '_blank', 'noopener');
  };

  // ===== Outlook =====
  const openOutlook = () => {
    const params = new URLSearchParams();
    if (subject.trim()) params.set('subject', subject);
    if (body.trim())    params.set('body', body);
    window.open(`https://outlook.live.com/mail/deeplink/compose?${params.toString()}`, '_blank', 'noopener');
  };

  // ===== Send via server =====
  const sendServer = async () => {
    setSending(true);
    try {
      const res = await api<any>('/campaigns/send', {
        method: 'POST',
        body: JSON.stringify({
          name:      subject || (de ? 'Nachricht' : 'Message'),
          audience:  seg,
          channel:   chan,
          message:   body,
          measureId: measureId || undefined,
          stage:     stage     || undefined,
        }),
      });
      toast?.success(de
        ? `Gesendet an ${res?.sent ?? 0} von ${res?.totalRecipients ?? 0} Empfängern.`
        : `Sent to ${res?.sent ?? 0} of ${res?.totalRecipients ?? 0} recipients.`);
      setSubject(''); setBody('');
      await load();
    } catch (e) {
      toast?.error(de ? 'Senden fehlgeschlagen.' : 'Send failed.');
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
      await fetch(`${API}/campaigns/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      await load();
      toast?.success(de ? 'Kampagne gelöscht.' : 'Campaign deleted.');
    } catch (e) { console.error(e); }
  };

  const chanLabel = (typeOrId: string) => {
    const c = channels.find((x) => x.type === typeOrId || x.id === typeOrId);
    return c ? c.name : typeOrId;
  };

  const connectedChannels = channels.filter((c) => c.connected);

  const audienceSummary = () => {
    const parts: string[] = [];
    const meas = measures.find((m) => m.id === measureId);
    if (measureId && meas) parts.push(translateText(meas.name, lang));
    const stageLabel = STAGES.find((s) => s.value === stage)?.[de ? 'de' : 'en'];
    if (stage && stageLabel) parts.push(stageLabel);
    if (!measureId && !stage) {
      if (seg === 'seg_active')      parts.push(de ? 'Aktive Teilnehmer' : 'Active participants');
      if (seg === 'seg_all_alumni')  parts.push(de ? 'Alle Alumni' : 'All alumni');
      if (seg === 'seg_alumni_emp')  parts.push(de ? 'Beschäftigt' : 'Employed');
      if (seg === 'seg_alumni_seek') parts.push(de ? 'Jobsuchend' : 'Job-seeking');
    }
    return parts.join(' · ') || (de ? 'Alle' : 'All');
  };

  return (
    <>
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
                  <button onClick={() => toggleChannel(c.id, c.connected)}
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

          {/* ===== FILTER: Bootcamp ===== */}
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Layers size={12} color={C.iris} /> {de ? 'Bootcamp / Maßnahme' : 'Bootcamp / Measure'}
          </div>
          <select value={measureId} onChange={(e) => setMeasureId(e.target.value)}
            style={{ ...selectSt, marginBottom: 10, width: '100%', color: measureId ? C.iris : C.muted, fontWeight: measureId ? 600 : 400, border: `1.5px solid ${measureId ? C.iris : C.line}` }}>
            <option value="">{de ? '— Alle Bootcamps —' : '— All Bootcamps —'}</option>
            {measures.map((m) => (
              <option key={m.id} value={m.id}>{translateText(m.name, lang)}</option>
            ))}
          </select>

          {/* ===== FILTER: Stage ===== */}
          <div style={{ fontSize: 11.5, fontWeight: 700, color: C.inkSoft, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Filter size={12} color={C.iris} /> {de ? 'Phase / Stage' : 'Stage'}
          </div>
          <select value={stage} onChange={(e) => setStage(e.target.value)}
            style={{ ...selectSt, marginBottom: 10, width: '100%', color: stage ? C.iris : C.muted, fontWeight: stage ? 600 : 400, border: `1.5px solid ${stage ? C.iris : C.line}` }}>
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>{de ? s.de : s.en}</option>
            ))}
          </select>

          {/* Active filters summary */}
          {(measureId || stage) && (
            <div style={{ marginBottom: 10, padding: '7px 10px', borderRadius: 8, background: C.iris + '08', border: `1px solid ${C.iris}`, fontSize: 12, color: C.iris, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Filter size={12} />
              <span style={{ fontWeight: 600 }}>{de ? 'Filter aktiv:' : 'Filter active:'}</span>
              {measureId && <span>{translateText(measures.find((m) => m.id === measureId)?.name ?? '', lang)}</span>}
              {measureId && stage && <span>·</span>}
              {stage && <span>{STAGES.find((s) => s.value === stage)?.[de ? 'de' : 'en']}</span>}
              <button onClick={() => { setMeasureId(''); setStage(''); setPreview(null); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={12} />
              </button>
            </div>
          )}

          {/* Preview recipients button */}
          <div style={{ marginBottom: 10 }}>
            <button
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}
              disabled={previewing}
              onClick={fetchPreview}>
              <Eye size={14} />
              {previewing ? '...' : (de ? 'Empfänger voranzeigen' : 'Preview recipients')}
            </button>
            {preview && (
              <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 9, background: C.mint + '10', border: `1px solid ${C.mint}`, fontSize: 12.5 }}>
                <div style={{ fontWeight: 700, color: C.mint, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={13} /> {preview.total} {de ? 'Empfänger gefunden' : 'recipients found'}
                </div>
                {preview.recipients.slice(0, 5).map((r, i) => (
                  <div key={i} style={{ fontSize: 11.5, color: C.inkSoft }}>
                    {r.name} — {r.email}
                  </div>
                ))}
                {preview.total > 5 && (
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    +{preview.total - 5} {de ? 'weitere...' : 'more...'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audience tabs */}
          <div style={{ fontSize: 11.5, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>{t('cm_to')}</div>
          <div className="seg" style={{ flexWrap: 'wrap', marginBottom: 10 }}>
            {segs.map((s) => (
              <button key={s} className={seg === s ? 'p' : ''} onClick={() => setSeg(s)} style={{ fontSize: 11 }}>
                {t(s)}
              </button>
            ))}
          </div>

          {/* Channel */}
          <div style={{ fontSize: 11.5, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>{t('cm_via')}</div>
          <div className="seg" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
            {connectedChannels.length === 0
              ? <span style={{ fontSize: 11.5, color: C.mutedLight }}>{de ? 'Keine Kanäle verbunden' : 'No channels connected'}</span>
              : connectedChannels.map((c) => (
                  <button key={c.id} className={chan === c.type ? 'p' : ''} onClick={() => setChan(c.type)} style={{ fontSize: 11 }}>
                    {c.name}
                  </button>
                ))}
          </div>

          {/* Audience summary */}
          <div style={{ marginBottom: 10, padding: '6px 10px', borderRadius: 8, background: C.soft, fontSize: 12, color: C.inkSoft, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Megaphone size={12} color={C.iris} />
            {de ? 'Empfänger:' : 'Recipients:'} <strong style={{ color: C.iris }}>{audienceSummary()}</strong>
            {preview && <span style={{ marginLeft: 'auto', color: C.mint, fontWeight: 700 }}>{preview.total}</span>}
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
        <div onClick={() => setPickOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 360, padding: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
              {de ? 'Wohin senden?' : 'Send via…'}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
              {de ? 'Empfänger:' : 'Recipients:'} <strong style={{ color: C.iris }}>{audienceSummary()}</strong>
              {preview && <span style={{ color: C.mint, marginLeft: 6, fontWeight: 700 }}>· {preview.total}</span>}
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
                  <div style={{ fontSize: 11.5, color: C.muted }}>{de ? 'Direkt an gefilterte Empfänger' : 'Directly to filtered recipients'}</div>
                </div>
              </button>

              {/* Gmail */}
              <button onClick={() => { setPickOpen(false); openGmail(); }}
                style={{ padding: '12px 16px', borderRadius: 10, border: '1.5px solid #EA4335', background: '#EA433508', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: '#EA4335', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <GmailSvg size={18} />
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
                  <OutlookSvg size={18} />
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
const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16,
};
const selectSt: React.CSSProperties = {
  padding: '8px 11px', borderRadius: 9,
  border: `1.5px solid ${C.line}`,
  fontSize: 12.5, outline: 'none', cursor: 'pointer', background: '#fff',
};


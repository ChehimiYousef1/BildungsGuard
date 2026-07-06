import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CalendarClock, FolderCheck, BadgeCheck,
  FileCheck2, CheckCircle2, Users, BookOpen, FileText,
  Plus, X, Trash2, Download, Pencil, AlertTriangle
} from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Stat } from '../../components/Stat';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

const daysUntil = (dateStr: string | null | undefined): number | null => {
  if (!dateStr) return null;
  try {
    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map(Number);
    return Math.ceil((new Date(y, m - 1, d).getTime() - Date.now()) / 86400000);
  } catch { return null; }
};

const daysColor = (days: number | null) => {
  if (days === null) return C.muted;
  if (days <= 30)    return C.rose;
  if (days <= 90)    return C.amber;
  return C.mint;
};

const daysLabel = (days: number | null, de: boolean) => {
  if (days === null) return '—';
  if (days < 0)  return de ? `${Math.abs(days)} Tage überfällig ⚠️` : `${Math.abs(days)} days overdue ⚠️`;
  if (days === 0) return de ? 'Heute!' : 'Today!';
  return de ? `in ${days} Tagen` : `in ${days} days`;
};

export default function Audit() {
  const { t, lang, pendingSample, setPendingSample } = useApp();
  const de = lang === 'de';

  const [n,             setN]             = useState(5);
  const [sample,        setSample]        = useState<any[]>([]);
  const [drawing,       setDrawing]       = useState(false);
  const [readiness,     setReadiness]     = useState<any>(null);
  const [tenant,        setTenant]        = useState<any>(null);
  const [audits,        setAudits]        = useState<any[]>([]);
  const [bundleLoading, setBundleLoading] = useState<string | null>(null);

  const [open,   setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [form,   setForm]   = useState({ date: '', body: '', type: '', findings: '', status: 'fixed' });

  const [datesOpen,   setDatesOpen]   = useState(false);
  const [datesSaving, setDatesSaving] = useState(false);
  const [datesForm,   setDatesForm]   = useState({ nextAudit: '', azavValidUntil: '', certBody: '' });

  const loadAll = async () => {
    try {
      const [r, tn, ex] = await Promise.all([
        api<any>('/audit/readiness').catch(() => null),
        api<any>('/tenants/me').catch(() => null),
        api<any[]>('/audit/external').catch(() => []),
      ]);
      setReadiness(r);
      setTenant(tn);
      setAudits(Array.isArray(ex) ? ex : []);
    } catch { /* ignore */ }
  };
  useEffect(() => { loadAll(); }, []);

  const draw = async (count: number) => {
    setDrawing(true);
    try {
      const record = await api<any>('/audit/sample', { method: 'POST', body: JSON.stringify({ n: count }) });
      setSample(Array.isArray(record?.sample) ? record.sample : []);
    } catch (e) {
      console.error('draw sample failed', e);
      alert('Sample failed — check you are logged in as admin.');
    } finally { setDrawing(false); }
  };

  useEffect(() => {
    if (pendingSample) { setN(pendingSample.n); draw(pendingSample.n); setPendingSample(null); }
  }, [pendingSample]);

  const openDatesEdit = () => {
    setDatesForm({
      nextAudit:      tenant?.nextAudit      ?? '',
      azavValidUntil: tenant?.azavValidUntil ?? '',
      certBody:       tenant?.certifier      ?? '',
    });
    setDatesOpen(true);
  };

  const saveDates = async () => {
    setDatesSaving(true);
    try {
      await api('/tenants/me', {
        method: 'PATCH',
        body: JSON.stringify({
          nextAudit:      datesForm.nextAudit.trim()      || undefined,
          azavValidUntil: datesForm.azavValidUntil.trim() || undefined,
          certifier:      datesForm.certBody.trim()       || undefined,
        }),
      });
      setDatesOpen(false);
      await loadAll();
    } catch (e) {
      console.error('save tenant dates failed', e);
      alert(de ? 'Fehler beim Speichern.' : 'Save failed.');
    } finally { setDatesSaving(false); }
  };

  const downloadBundle = async (kind: 'participants' | 'Bootcamps' | 'funding') => {
    setBundleLoading(kind);
    try {
      const token = getToken();
      const res = await fetch(`${API}/pdf/bundle/${kind}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `${kind}-bundle.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('bundle download failed', e);
      alert('PDF export failed');
    } finally { setBundleLoading(null); }
  };

  const submitAudit = async () => {
    if (!form.body.trim() && !form.type.trim()) return;
    setSaving(true);
    try {
      await api('/audit/external', { method: 'POST', body: JSON.stringify(form) });
      setOpen(false);
      setForm({ date: '', body: '', type: '', findings: '', status: 'fixed' });
      loadAll();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const delAudit = async (id: string) => {
    try {
      const token = getToken();
      await fetch(`${API}/audit/external/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      loadAll();
    } catch (e) { console.error(e); }
  };

  const bundles: [string, string, JSX.Element, 'participants' | 'Bootcamps' | 'funding'][] = [
    [t('be_part'),   t('be_part_d'),   <Users    size={16} />, 'participants'],
    [t('be_meas'),   t('be_meas_d'),   <BookOpen size={16} />, 'Bootcamps'],
    [t('be_settle'), t('be_settle_d'), <FileText size={16} />, 'funding'],
  ];

  const nextAuditDays = daysUntil(tenant?.nextAudit);
  const recertDays    = daysUntil(tenant?.azavValidUntil);

  return (
    <>
      {/* ===== STATS ===== */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 18 }}>

        <Stat icon={<ShieldCheck size={18} />} num={readiness ? `${readiness.readiness}%` : '…'} label={t('readiness')} tone={C.mint} />

        {/* Next surveillance audit */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={openDatesEdit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <CalendarClock size={18} color={daysColor(nextAuditDays)} />
            <Pencil size={12} color={C.muted} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: daysColor(nextAuditDays) }}>
            {tenant?.nextAudit ?? '—'}
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{t('next_audit_l')}</div>
          {nextAuditDays !== null && (
            <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: daysColor(nextAuditDays) }}>
              {nextAuditDays <= 30 && <AlertTriangle size={10} style={{ marginRight: 3 }} />}
              {daysLabel(nextAuditDays, de)}
            </div>
          )}
        </div>

        <Stat icon={<FolderCheck size={18} />} num={String(audits.length)} label={t('audits_hist')} tone={C.iris} />

        {/* Re-certification due */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={openDatesEdit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <BadgeCheck size={18} color={daysColor(recertDays)} />
            <Pencil size={12} color={C.muted} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: daysColor(recertDays) }}>
            {tenant?.azavValidUntil ?? '—'}
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{t('recert_due')}</div>
          {recertDays !== null && (
            <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: daysColor(recertDays) }}>
              {recertDays <= 90 && <AlertTriangle size={10} style={{ marginRight: 3 }} />}
              {daysLabel(recertDays, de)}
            </div>
          )}
        </div>
      </div>

      {/* Banner لو الـ dates ناقصة */}
      {(!tenant?.nextAudit || !tenant?.azavValidUntil) && (
        <div onClick={openDatesEdit} style={{
          marginBottom: 15, padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
          background: C.amber + '10', border: `1px solid ${C.amber}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <AlertTriangle size={16} color={C.amber} />
          <span style={{ flex: 1, color: C.amber, fontWeight: 600, fontSize: 13 }}>
            {de ? 'Audit-Daten fehlen — Klicken zum Einrichten' : 'Audit dates missing — Click to set up'}
          </span>
          <Pencil size={14} color={C.amber} />
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 15 }}>

        {/* Sample */}
        <div className="card">
          <div className="card-head"><div className="card-title">{t('draw_sample')}</div></div>
          <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>{t('draw_desc')}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13 }}>{t('count_files')}</span>
            <div className="seg">
              {[3, 5, 8].map((x) => <button key={x} className={n === x ? 'p' : ''} onClick={() => setN(x)}>{x}</button>)}
            </div>
            <button className="btn btn-primary" style={{ marginLeft: 'auto' }} disabled={drawing} onClick={() => draw(n)}>
              <FileCheck2 size={16} /> {drawing ? '…' : t('sample_btn')}
            </button>
          </div>
          {sample.length > 0 && (
            <div>
              {sample.map((p, i) => (
                <div key={p.id ?? i} className="doc-row">
                  <CheckCircle2 size={17} color={C.mint} />
                  <Avatar n={p.name} c={p.c} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div className="mono" style={{ fontSize: 11, color: C.muted }}>
                      Teilnehmerakte_{(p.name || '').replace(/ /g, '_')}.pdf
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: C.muted }}>{p.fileCompleteness ?? 0}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bundle export */}
        <div className="card">
          <div className="card-head"><div className="card-title">{t('bundle_exp')}</div></div>
          {bundles.map(([a, b, ic, kind], i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '13px 0', borderTop: i ? `1px solid ${C.lineSoft}` : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.soft, display: 'grid', placeItems: 'center', color: C.inkSoft }}>{ic}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a}</div>
                <div style={{ fontSize: 11.5, color: C.muted }}>{b}</div>
              </div>
              <button className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12 }}
                disabled={bundleLoading !== null} onClick={() => downloadBundle(kind)}>
                <Download size={14} /> {bundleLoading === kind ? '…' : 'PDF'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Audit history */}
      <div className="card" style={{ padding: '19px 8px 8px' }}>
        <div className="card-head" style={{ padding: '0 13px' }}>
          <div className="card-title">{t('audit_history')}</div>
          <button className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => setOpen(true)}>
            <Plus size={14} /> {t('add') || 'Add'}
          </button>
        </div>
        {audits.length === 0 ? (
          <div style={{ padding: 16, color: C.muted, fontSize: 13 }}>
            {de ? 'Noch keine Audits erfasst.' : 'No audits recorded yet.'}
          </div>
        ) : (
          <div className="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>{t('col_date')}</th><th>{t('col_stelle')}</th><th>{t('col_type')}</th>
                  <th className="hide-mobile">{t('col_find')}</th><th>{t('col_status')}</th><th></th>
                </tr>
              </thead>
              <tbody>
                {audits.map((a, i) => (
                  <tr key={a.id ?? i} className="row">
                    <td className="mono" style={{ fontWeight: 600 }}>{a.date ?? '—'}</td>
                    <td>{a.body ?? '—'}</td>
                    <td>{a.type ?? '—'}</td>
                    <td className="hide-mobile">{a.findings ?? '—'}</td>
                    <td><Badge s={a.status} /></td>
                    <td>
                      <button onClick={() => delAudit(a.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mutedLight }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== DATES EDIT MODAL ===== */}
      {datesOpen && (
        <div onClick={() => !datesSaving && setDatesOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 440, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {de ? 'Audit-Daten bearbeiten' : 'Edit audit dates'}
              </div>
              <button onClick={() => setDatesOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: 9, background: C.iris + '08', fontSize: 12, color: C.iris, marginBottom: 16, lineHeight: 1.7 }}>
              ℹ️ {de
                ? 'Next surveillance audit = nächster AZAV-Überwachungstermin\nRe-certification due = Ablaufdatum der AZAV-Zulassung\nBeide Felder werden als Countdown angezeigt und lösen Warnungen aus.'
                : 'Next surveillance audit = next scheduled AZAV review\nRe-certification due = AZAV certification expiry\nBoth are shown as countdowns with automatic warnings.'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div>
                <label style={lbl}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <CalendarClock size={14} color={C.amber} />
                    <span>{de ? 'Nächstes Überwachungsaudit' : 'Next surveillance audit'}</span>
                  </div>
                  <input value={datesForm.nextAudit}
                    onChange={(e) => setDatesForm((f) => ({ ...f, nextAudit: e.target.value }))}
                    style={inp} placeholder="TT.MM.JJJJ" />
                </label>
                {datesForm.nextAudit && (() => {
                  const d = daysUntil(datesForm.nextAudit);
                  return d !== null ? <div style={{ fontSize: 11.5, marginTop: 4, color: daysColor(d), fontWeight: 600 }}>→ {daysLabel(d, de)}</div> : null;
                })()}
              </div>

              <div>
                <label style={lbl}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <BadgeCheck size={14} color={C.iris} />
                    <span>{de ? 'Re-Zertifizierung fällig' : 'Re-certification due'}</span>
                  </div>
                  <input value={datesForm.azavValidUntil}
                    onChange={(e) => setDatesForm((f) => ({ ...f, azavValidUntil: e.target.value }))}
                    style={inp} placeholder="TT.MM.JJJJ" />
                </label>
                {datesForm.azavValidUntil && (() => {
                  const d = daysUntil(datesForm.azavValidUntil);
                  return d !== null ? <div style={{ fontSize: 11.5, marginTop: 4, color: daysColor(d), fontWeight: 600 }}>→ {daysLabel(d, de)}</div> : null;
                })()}
              </div>

              <label style={lbl}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <ShieldCheck size={14} color={C.mint} />
                  <span>{de ? 'Zertifizierungsstelle' : 'Certification body'}</span>
                </div>
                <input value={datesForm.certBody}
                  onChange={(e) => setDatesForm((f) => ({ ...f, certBody: e.target.value }))}
                  style={inp} placeholder="CertQua, TÜV, DEKRA…" />
              </label>

              <div style={{ display: 'flex', gap: 12, fontSize: 11.5, padding: '8px 0', borderTop: `1px solid ${C.lineSoft}` }}>
                {[[C.mint, '> 90d OK'], [C.amber, '30–90d ⚠️'], [C.rose, '< 30d 🚨']].map(([col, label]: any, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col }} />
                    <span style={{ color: C.muted }}>{label}</span>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={datesSaving} onClick={() => setDatesOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={datesSaving} onClick={saveDates}>
                  {datesSaving ? '…' : (de ? 'Speichern' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD AUDIT MODAL ===== */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 440, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {de ? 'Audit hinzufügen' : 'Add audit'}
              </div>
              <button onClick={() => !saving && setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Datum' : 'Date'}
                <input value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={inp} placeholder="18.07.2025" />
              </label>
              <label style={lbl}>{de ? 'Stelle' : 'Body'}
                <input value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} style={inp} placeholder="CertQua" />
              </label>
              <label style={lbl}>{de ? 'Typ' : 'Type'}
                <input value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={inp} placeholder={de ? 'Überwachungsaudit' : 'Surveillance audit'} />
              </label>
              <label style={lbl}>{de ? 'Feststellungen' : 'Findings'}
                <input value={form.findings} onChange={(e) => setForm((f) => ({ ...f, findings: e.target.value }))} style={inp} placeholder={de ? '2 Nebenbestimmungen' : '2 secondary conditions'} />
              </label>
              <label style={lbl}>Status
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} style={inp}>
                  <option value="fixed">{de ? 'Behoben' : 'Fixed'}</option>
                  <option value="passed">{de ? 'Bestanden' : 'Passed'}</option>
                  <option value="open">{de ? 'Offen' : 'Open'}</option>
                </select>
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving} onClick={() => setOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={saving} onClick={submitAudit}>
                  {saving ? '…' : (de ? 'Speichern' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16,
};
const lbl: React.CSSProperties = { fontSize: 12.5, color: C.inkSoft, display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = {
  width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9,
  border: `1px solid ${C.line}`, fontSize: 13, outline: 'none',
};
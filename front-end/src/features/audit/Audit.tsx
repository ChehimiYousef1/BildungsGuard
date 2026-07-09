import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, CalendarClock, FolderCheck, BadgeCheck,
  FileCheck2, CheckCircle2, Users, BookOpen, FileText,
  Plus, X, Trash2, Download, Pencil, AlertTriangle,
  ChevronLeft, ChevronRight, Search, Filter
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
  if (days < 0)   return de ? `${Math.abs(days)} Tage überfällig ⚠️` : `${Math.abs(days)} days overdue ⚠️`;
  if (days === 0) return de ? 'Heute!' : 'Today!';
  return de ? `in ${days} Tagen` : `in ${days} days`;
};

const PAGE_SIZE = 5;

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

  // ===== Pagination + Filter for sample =====
  const [samplePage,    setSamplePage]    = useState(1);
  const [sampleSearch,  setSampleSearch]  = useState('');
  const [sampleFilter,  setSampleFilter]  = useState('all'); // all | complete | incomplete

  // ===== Pagination + Filter for audit history =====
  const [auditPage,   setAuditPage]   = useState(1);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('all'); // all | fixed | open | pending

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
    setSamplePage(1);
    setSampleSearch('');
    setSampleFilter('all');
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

  // ===== Filtered + Paginated Sample =====
  const filteredSample = sample
    .filter((p) => {
      if (sampleSearch && !p.name?.toLowerCase().includes(sampleSearch.toLowerCase())) return false;
      if (sampleFilter === 'complete'   && (p.fileCompleteness ?? 0) < 100) return false;
      if (sampleFilter === 'incomplete' && (p.fileCompleteness ?? 0) >= 100) return false;
      return true;
    });
  const sampleTotalPages = Math.ceil(filteredSample.length / PAGE_SIZE);
  const samplePaged      = filteredSample.slice((samplePage - 1) * PAGE_SIZE, samplePage * PAGE_SIZE);

  // ===== Filtered + Paginated Audits =====
  const filteredAudits = audits
    .filter((a) => {
      if (auditSearch && !a.body?.toLowerCase().includes(auditSearch.toLowerCase()) &&
                        !a.type?.toLowerCase().includes(auditSearch.toLowerCase())) return false;
      if (auditFilter !== 'all' && a.status !== auditFilter) return false;
      return true;
    });
  const auditTotalPages = Math.ceil(filteredAudits.length / PAGE_SIZE);
  const auditPaged      = filteredAudits.slice((auditPage - 1) * PAGE_SIZE, auditPage * PAGE_SIZE);

  return (
    <>
      {/* ===== STATS ===== */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 18 }}>
        <Stat icon={<ShieldCheck size={18} />} num={readiness ? `${readiness.readiness}%` : '…'} label={t('readiness')} tone={C.mint} />

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={openDatesEdit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <CalendarClock size={18} color={daysColor(nextAuditDays)} />
            <Pencil size={12} color={C.muted} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 20, color: daysColor(nextAuditDays) }}>
            {tenant?.nextAudit ?? '—'}
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{t('next_audit_l')}</div>
          {nextAuditDays !== null && (
            <div style={{ fontSize: 11, color: daysColor(nextAuditDays), marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
              {nextAuditDays <= 30 && <AlertTriangle size={10} style={{ marginRight: 3 }} />}
              {daysLabel(nextAuditDays, de)}
            </div>
          )}
        </div>

        <Stat icon={<FolderCheck size={18} />} num={String(audits.length)} label={t('audits_hist')} tone={C.iris} />

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={openDatesEdit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <BadgeCheck size={18} color={daysColor(recertDays)} />
            <Pencil size={12} color={C.muted} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 20, color: daysColor(recertDays) }}>
            {tenant?.azavValidUntil ?? '—'}
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{t('recert_due')}</div>
          {recertDays !== null && (
            <div style={{ fontSize: 11, color: daysColor(recertDays), marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
              {recertDays <= 90 && <AlertTriangle size={10} style={{ marginRight: 3 }} />}
              {daysLabel(recertDays, de)}
            </div>
          )}
        </div>
      </div>

      {tenant?.certifier && (
        <div style={{
          marginBottom: 15, padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
          background: C.soft, border: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', gap: 10,
        }} onClick={openDatesEdit}>
          <BadgeCheck size={18} color={C.iris} />
          <span style={{ flex: 1, color: C.amber, fontWeight: 600, fontSize: 13 }}>
            {de ? 'Zertifizierungsstelle:' : 'Certification body:'} {tenant.certifier}
          </span>
          <Pencil size={14} color={C.muted} />
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 15 }}>

        {/* ===== SAMPLE ===== */}
        <div className="card">
          <div className="card-head"><div className="card-title">{t('draw_sample')}</div></div>
          <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>{t('draw_desc')}</div>

          {/* Arrow controls */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13 }}>{t('count_files')}</span>
            <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${C.line}`, borderRadius: 9, overflow: 'hidden' }}>
              <button
                onClick={() => setN((v) => Math.max(1, v - 1))}
                style={{ padding: '6px 12px', background: 'none', border: 'none', borderRight: `1px solid ${C.line}`, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <ChevronLeft size={15} color={C.muted} />
              </button>
              <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 700, fontSize: 14, color: C.iris, padding: '0 8px' }}>{n}</span>
              <button
                onClick={() => setN((v) => v + 1)}
                style={{ padding: '6px 12px', background: 'none', border: 'none', borderLeft: `1px solid ${C.line}`, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <ChevronRight size={15} color={C.muted} />
              </button>
            </div>
            <button className="btn btn-primary" style={{ marginLeft: 'auto' }} disabled={drawing} onClick={() => draw(n)}>
              <FileCheck2 size={16} /> {drawing ? '…' : t('sample_btn')}
            </button>
          </div>

          {/* Sample filter + search */}
          {sample.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, padding: '7px 11px', borderRadius: 9, border: `1px solid ${C.line}`, background: '#fff' }}>
                <Search size={13} color={C.muted} />
                <input
                  value={sampleSearch}
                  onChange={(e) => { setSampleSearch(e.target.value); setSamplePage(1); }}
                  placeholder={de ? 'Suchen...' : 'Search...'}
                  style={{ border: 'none', outline: 'none', fontSize: 12.5, flex: 1, background: 'transparent' }}
                />
              </div>
              <select
                value={sampleFilter}
                onChange={(e) => { setSampleFilter(e.target.value); setSamplePage(1); }}
                style={{ padding: '7px 10px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 12, outline: 'none', background: '#fff' }}>
                <option value="all">{de ? 'Alle' : 'All'}</option>
                <option value="complete">{de ? 'Vollständig' : 'Complete'}</option>
                <option value="incomplete">{de ? 'Unvollständig' : 'Incomplete'}</option>
              </select>
            </div>
          )}

          {/* Sample list */}
          {samplePaged.map((p, i) => (
            <div key={p.id ?? i} className="doc-row">
              <CheckCircle2 size={17} color={(p.fileCompleteness ?? 0) >= 100 ? C.mint : C.amber} />
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

          {/* Sample pagination */}
          {sampleTotalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 }}>
              <button
                onClick={() => setSamplePage((p) => Math.max(1, p - 1))}
                disabled={samplePage === 1}
                style={{ padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.line}`, background: samplePage === 1 ? C.soft : '#fff', cursor: samplePage === 1 ? 'default' : 'pointer', display: 'grid', placeItems: 'center' }}>
                <ChevronLeft size={15} color={samplePage === 1 ? C.muted : C.iris} />
              </button>
              <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>
                {samplePage} / {sampleTotalPages}
              </span>
              <button
                onClick={() => setSamplePage((p) => Math.min(sampleTotalPages, p + 1))}
                disabled={samplePage === sampleTotalPages}
                style={{ padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.line}`, background: samplePage === sampleTotalPages ? C.soft : '#fff', cursor: samplePage === sampleTotalPages ? 'default' : 'pointer', display: 'grid', placeItems: 'center' }}>
                <ChevronRight size={15} color={samplePage === sampleTotalPages ? C.muted : C.iris} />
              </button>
            </div>
          )}

          {sample.length > 0 && filteredSample.length === 0 && (
            <div style={{ padding: '10px 0', color: C.muted, fontSize: 13, textAlign: 'center' }}>
              {de ? 'Keine Ergebnisse.' : 'No results.'}
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

      {/* ===== AUDIT HISTORY ===== */}
      <div className="card" style={{ padding: '19px 8px 8px' }}>
        <div className="card-head" style={{ padding: '0 13px' }}>
          <div className="card-title">{t('audit_history')}</div>
          <button className="btn btn-primary" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => setOpen(true)}>
            <Plus size={14} /> {t('add') || 'Add'}
          </button>
        </div>

        {/* Audit filter + search */}
        <div style={{ display: 'flex', gap: 8, margin: '12px 13px 8px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 7, padding: '7px 11px', borderRadius: 9, border: `1px solid ${C.line}`, background: '#fff' }}>
            <Search size={13} color={C.muted} />
            <input
              value={auditSearch}
              onChange={(e) => { setAuditSearch(e.target.value); setAuditPage(1); }}
              placeholder={de ? 'Suchen...' : 'Search...'}
              style={{ border: 'none', outline: 'none', fontSize: 12.5, flex: 1, background: 'transparent' }}
            />
          </div>
          <select
            value={auditFilter}
            onChange={(e) => { setAuditFilter(e.target.value); setAuditPage(1); }}
            style={{ padding: '7px 10px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 12, outline: 'none', background: '#fff' }}>
            <option value="all">{de ? 'Alle' : 'All'}</option>
            <option value="fixed">{de ? 'Behoben' : 'Fixed'}</option>
            <option value="open">{de ? 'Offen' : 'Open'}</option>
            <option value="pending">{de ? 'Ausstehend' : 'Pending'}</option>
          </select>
        </div>

        {/* Audit rows */}
        {audits.length === 0 && (
          <div style={{ padding: '16px 13px', color: C.muted, fontSize: 13 }}>
            {de ? 'Keine Auditeinträge.' : 'No audit entries.'}
          </div>
        )}

        {filteredAudits.length === 0 && audits.length > 0 && (
          <div style={{ padding: '16px 13px', color: C.muted, fontSize: 13 }}>
            {de ? 'Keine Ergebnisse.' : 'No results.'}
          </div>
        )}

        <div className="scroll-x">
          {auditPaged.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>{de ? 'Datum' : 'Date'}</th>
                  <th>{de ? 'Typ' : 'Type'}</th>
                  <th className="hide-mobile">{de ? 'Beschreibung' : 'Description'}</th>
                  <th className="hide-mobile">{de ? 'Feststellungen' : 'Findings'}</th>
                  <th>{de ? 'Status' : 'Status'}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {auditPaged.map((a, i) => (
                  <tr key={a.id ?? i} className="row">
                    <td className="mono" style={{ fontSize: 12 }}>{a.date ?? '—'}</td>
                    <td style={{ fontSize: 12.5 }}>{a.type ?? '—'}</td>
                    <td className="hide-mobile" style={{ fontSize: 12.5 }}>{a.body ?? '—'}</td>
                    <td className="hide-mobile" style={{ fontSize: 12, color: C.muted }}>{a.findings ?? '—'}</td>
                    <td><Badge s={a.status} /></td>
                    <td>
                      <button onClick={() => delAudit(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <Trash2 size={14} color={C.muted} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Audit pagination */}
        {auditTotalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '12px 0 4px' }}>
            <button
              onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
              disabled={auditPage === 1}
              style={{ padding: '6px 12px', borderRadius: 9, border: `1px solid ${C.line}`, background: auditPage === 1 ? C.soft : '#fff', cursor: auditPage === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ChevronLeft size={14} color={auditPage === 1 ? C.muted : C.iris} />
              <span style={{ fontSize: 12, color: auditPage === 1 ? C.muted : C.iris }}>{de ? 'Zurück' : 'Prev'}</span>
            </button>
            <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>
              {auditPage} / {auditTotalPages} · {filteredAudits.length} {de ? 'Einträge' : 'entries'}
            </span>
            <button
              onClick={() => setAuditPage((p) => Math.min(auditTotalPages, p + 1))}
              disabled={auditPage === auditTotalPages}
              style={{ padding: '6px 12px', borderRadius: 9, border: `1px solid ${C.line}`, background: auditPage === auditTotalPages ? C.soft : '#fff', cursor: auditPage === auditTotalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12, color: auditPage === auditTotalPages ? C.muted : C.iris }}>{de ? 'Weiter' : 'Next'}</span>
              <ChevronRight size={14} color={auditPage === auditTotalPages ? C.muted : C.iris} />
            </button>
          </div>
        )}
      </div>

      {/* ===== ADD AUDIT MODAL ===== */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 460, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {de ? 'Externer Audit' : 'External audit'}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Datum' : 'Date'}
                <input value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  style={inp} placeholder="01.07.2026" />
              </label>
              <label style={lbl}>{de ? 'Typ' : 'Type'}
                <input value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  style={inp} placeholder={de ? 'z.B. Überwachungsaudit' : 'e.g. Surveillance audit'} />
              </label>
              <label style={lbl}>{de ? 'Beschreibung' : 'Description'}
                <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  style={{ ...inp, minHeight: 70, resize: 'vertical' }} />
              </label>
              <label style={lbl}>{de ? 'Feststellungen' : 'Findings'}
                <input value={form.findings} onChange={(e) => setForm((f) => ({ ...f, findings: e.target.value }))}
                  style={inp} placeholder={de ? 'Optional...' : 'Optional...'} />
              </label>
              <label style={lbl}>{de ? 'Status' : 'Status'}
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} style={inp}>
                  <option value="fixed">{de ? 'Behoben' : 'Fixed'}</option>
                  <option value="open">{de ? 'Offen' : 'Open'}</option>
                  <option value="pending">{de ? 'Ausstehend' : 'Pending'}</option>
                </select>
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving} onClick={() => setOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={saving} onClick={submitAudit}>
                  {saving ? '...' : (de ? 'Speichern' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT DATES MODAL ===== */}
      {datesOpen && (
        <div onClick={() => !datesSaving && setDatesOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 400, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {de ? 'Termine bearbeiten' : 'Edit dates'}
              </div>
              <button onClick={() => setDatesOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Nächstes Audit' : 'Next audit'}
                <input value={datesForm.nextAudit} onChange={(e) => setDatesForm((f) => ({ ...f, nextAudit: e.target.value }))}
                  style={inp} placeholder="01.07.2027" />
              </label>
              <label style={lbl}>{de ? 'AZAV-Zulassung gültig bis' : 'AZAV valid until'}
                <input value={datesForm.azavValidUntil} onChange={(e) => setDatesForm((f) => ({ ...f, azavValidUntil: e.target.value }))}
                  style={inp} placeholder="31.03.2027" />
              </label>
              <label style={lbl}>{de ? 'Zertifizierungsstelle' : 'Certification body'}
                <input value={datesForm.certBody} onChange={(e) => setDatesForm((f) => ({ ...f, certBody: e.target.value }))}
                  style={inp} placeholder="CertQua / TÜV / DEKRA..." />
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={datesSaving} onClick={() => setDatesOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={datesSaving} onClick={saveDates}>
                  {datesSaving ? '...' : (de ? 'Speichern' : 'Save')}
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
const lbl: React.CSSProperties = { fontSize: 12.5, color: '#334155', display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = {
  marginTop: 5, padding: '9px 11px', borderRadius: 9,
  border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', width: '100%',
};

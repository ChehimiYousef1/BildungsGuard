import React, { useState, useEffect } from 'react';
import { Download, ArrowLeft, CheckCircle2, Play, Circle, Plus, X, Trash2 } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

export default function BootcampDetail({ m, back }: any) {
  const { t, lang } = useApp();
  const de = lang === 'de';
  const [modules, setModules] = useState<any[]>([]);
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dl, setDl] = useState(false);

  // نموذج وحدة
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', ueHours: '', status: 'planned' });

  // نموذج تغيير
  const [openCh, setOpenCh] = useState(false);
  const [savingCh, setSavingCh] = useState(false);
  const [formCh, setFormCh] = useState({ date: '', reason: '', responsible: '' });

  const number = m?.number ?? m?.nr ?? '—';
  const azav = m?.azav ?? '—';
  const mode = m?.mode ?? '—';

  const load = async () => {
    try {
      const [mods, chs] = await Promise.all([
        api<any[]>(`/measures/${m.id}/modules`).catch(() => []),
        api<any[]>(`/measures/${m.id}/changes`).catch(() => []),
      ]);
      setModules(Array.isArray(mods) ? mods : []);
      setChanges(Array.isArray(chs) ? chs : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };
  useEffect(() => { if (m?.id) load(); }, [m?.id]);

  const ueTotal = modules.reduce((sum, x) => sum + (x.ueHours || 0), 0);

  const ci = (s: string) =>
    s === 'done' || s === 'complete' ? <CheckCircle2 size={16} color={C.mint} /> :
    s === 'active' || s === 'running' ? <Play size={13} color={C.iris} /> :
    <Circle size={14} color={C.mutedLight} />;

  // ===== تنزيل ملف المقياس (PDF) =====
  const downloadFile = async () => {
    setDl(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/pdf/bundle/measures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ids: [m.id] }),
      });
      if (!res.ok) throw new Error('PDF failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `massnahme-${m.number || m.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('download Bootcamp file failed', e);
      alert(de ? 'PDF konnte nicht erstellt werden.' : 'Could not generate PDF.');
    } finally { setDl(false); }
  };

  // ===== وحدات =====
  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await api(`/measures/${m.id}/modules`, {
        method: 'POST',
        body: JSON.stringify({ title: form.title.trim(), ueHours: Number(form.ueHours) || 0, status: form.status, order: modules.length }),
      });
      setOpen(false);
      setForm({ title: '', ueHours: '', status: 'planned' });
      setLoading(true);
      await load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const del = async (moduleId: string) => {
    try {
      const token = getToken();
      await fetch(`${API}/measures/${m.id}/modules/${moduleId}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      setLoading(true);
      await load();
    } catch (e) { console.error(e); }
  };

  // ===== تغييرات (Change history) =====
  const submitCh = async () => {
    if (!formCh.reason.trim()) return;
    setSavingCh(true);
    try {
      await api(`/measures/${m.id}/changes`, {
        method: 'POST',
        body: JSON.stringify({
          date: formCh.date.trim() || new Date().toLocaleDateString('de-DE'),
          reason: formCh.reason.trim(),
          responsible: formCh.responsible.trim() || undefined,
        }),
      });
      setOpenCh(false);
      setFormCh({ date: '', reason: '', responsible: '' });
      setLoading(true);
      await load();
    } catch (e) { console.error(e); }
    finally { setSavingCh(false); }
  };

  const delCh = async (changeId: string) => {
    try {
      const token = getToken();
      await fetch(`${API}/measures/${m.id}/changes/${changeId}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      setLoading(true);
      await load();
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <button className="back" onClick={back}><ArrowLeft size={15} /> {t('n_meas')}</button>
      <div className="detail-head"><div style={{ flex: 1 }}>
        <h2 className="disp" style={{ fontSize: 23, fontWeight: 700 }}>{m?.name}</h2>
        <div className="mono" style={{ color: C.muted, fontSize: 12.5, marginTop: 4 }}>Nr. {number} · AZAV {azav} · {ueTotal} UE · {mode}</div></div>
        <button className="btn btn-ghost" disabled={dl} onClick={downloadFile}><Download size={16} /> {dl ? '…' : t('meas_file')}</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Curriculum modules */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">{t('curriculum')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="mono" style={{ fontSize: 11.5, color: C.muted }}>{ueTotal} UE total</span>
              <button className="btn btn-primary" style={{ padding: '6px 11px', fontSize: 12 }} onClick={() => setOpen(true)}><Plus size={13} /> {t('add') || 'Add'}</button>
            </div>
          </div>
          {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}
          {!loading && modules.length === 0 && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>{de ? 'Noch keine Module' : 'No modules yet'}</div>}
          {!loading && modules.map((c, i) => (
            <div key={c.id ?? i} className="doc-row">
              {ci(c.status)}
              <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{c.title}</div>
              <span className="mono" style={{ fontSize: 12, color: C.muted, marginRight: 10 }}>{c.ueHours} UE</span>
              <button onClick={() => del(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mutedLight }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* Change history (حقيقي) */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">{t('changelog') || (de ? 'Änderungshistorie' : 'Change history')}</div>
            <button className="btn btn-primary" style={{ padding: '6px 11px', fontSize: 12 }} onClick={() => setOpenCh(true)}><Plus size={13} /> {t('add') || 'Add'}</button>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
            {de ? 'Jede Abweichung von der Zulassung wird protokolliert (Datum, Grund, Verantwortlicher).' : 'Every deviation from the approval is logged (date, reason, responsible person).'}
          </div>
          {loading && <div style={{ padding: 8, color: C.muted, fontSize: 12.5 }}>…</div>}
          {!loading && changes.length === 0 && (
            <div style={{ padding: '8px 0', fontSize: 12.5, color: C.muted }}>{de ? 'Noch keine Einträge.' : 'No entries yet.'}</div>
          )}
          {!loading && changes.map((c, i) => (
            <div key={c.id ?? i} style={{ padding: '11px 0', borderTop: `1px solid ${C.lineSoft}`, display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.reason}</div>
                <div className="mono" style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                  {c.date || '—'}{c.responsible ? ` · ${c.responsible}` : ''}
                </div>
              </div>
              <button onClick={() => delCh(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mutedLight }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* نموذج إضافة وحدة */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 420, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>{de ? 'Modul hinzufügen' : 'Add module'}</div>
              <button onClick={() => !saving && setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Titel' : 'Title'}<input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={inp} placeholder="Module 1 · Foundations" /></label>
              <label style={lbl}>UE<input type="number" min="0" value={form.ueHours} onChange={(e) => setForm((f) => ({ ...f, ueHours: e.target.value }))} style={inp} placeholder="120" /></label>
              <label style={lbl}>Status
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} style={inp}>
                  <option value="done">{de ? 'Abgeschlossen' : 'Done'}</option>
                  <option value="active">{de ? 'Aktiv' : 'Active'}</option>
                  <option value="planned">{de ? 'Geplant' : 'Planned'}</option>
                </select>
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }} disabled={saving} onClick={() => setOpen(false)}>{t('cancel') || 'Cancel'}</button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }} disabled={saving} onClick={submit}>{saving ? '…' : (t('save') || 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نموذج إضافة تغيير */}
      {openCh && (
        <div onClick={() => !savingCh && setOpenCh(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 420, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>{de ? 'Änderung protokollieren' : 'Log a change'}</div>
              <button onClick={() => !savingCh && setOpenCh(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Datum' : 'Date'}<input value={formCh.date} onChange={(e) => setFormCh((f) => ({ ...f, date: e.target.value }))} style={inp} placeholder={de ? 'TT.MM.JJJJ (optional)' : 'DD.MM.YYYY (optional)'} /></label>
              <label style={lbl}>{de ? 'Grund / Abweichung' : 'Reason / deviation'}<textarea value={formCh.reason} onChange={(e) => setFormCh((f) => ({ ...f, reason: e.target.value }))} style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder={de ? 'z.B. UE von 120 auf 140 erhöht' : 'e.g. UE increased from 120 to 140'} /></label>
              <label style={lbl}>{de ? 'Verantwortlicher' : 'Responsible'}<input value={formCh.responsible} onChange={(e) => setFormCh((f) => ({ ...f, responsible: e.target.value }))} style={inp} placeholder={de ? 'Name (optional)' : 'Name (optional)'} /></label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }} disabled={savingCh} onClick={() => setOpenCh(false)}>{t('cancel') || 'Cancel'}</button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }} disabled={savingCh} onClick={submitCh}>{savingCh ? '…' : (t('save') || 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 };
const lbl: React.CSSProperties = { fontSize: 12.5, color: C.inkSoft, display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = { width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13, outline: 'none' };
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { translateText } from '../../lib/translateName';
import { ChevronRight, Plus, X, Pencil, Trash2, Lock, Mail, Upload, Download, RefreshCw } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Bar2 } from '../../components/Bar';
import { api, getToken } from '../../lib/api';
import Akte from './Akte';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

// ===== Auto-generate password =====
const genPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export default function Participants() {
  const { t, lang, toast } = useApp();
  const de = lang === 'de';

  const [rows,      setRows]      = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [sel,       setSel]       = useState<number | null>(null);
  const [open,      setOpen]      = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [formErr,   setFormErr]   = useState<string | null>(null);
  const [Bootcamps, setBootcamps] = useState<any[]>([]);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [showPass,  setShowPass]  = useState(false);
  const importRef = React.useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    measureId: '', fundingType: '',
    voucher: '', agency: '', voucherValidUntil: '',
    fileCompleteness: '0', status: 'enrolled',
    password: '',
  });

  const load = async () => {
    try {
      const data = await api<any[]>('/participants');
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load participants');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const ensureBootcamps = async () => {
    if (Bootcamps.length === 0) {
      try {
        const m = await api<any[]>('/measures');
        setBootcamps(Array.isArray(m) ? m : []);
      } catch { setBootcamps([]); }
    }
  };

  const openForm = async () => {
    setEditId(null);
    const pwd = genPassword();
    setForm({
      name: '', email: '', phone: '',
      measureId: '', fundingType: '',
      voucher: '', agency: '', voucherValidUntil: '',
      fileCompleteness: '0', status: 'enrolled',
      password: pwd,
    });
    setShowPass(false);
    setFormErr(null);
    setOpen(true);
    await ensureBootcamps();
  };

  const openEdit = async (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditId(p.id);
    setForm({
      name:              p.name              ?? '',
      email:             p.contact           ?? p.email ?? '',
      phone:             p.phone             ?? '',
      measureId:         p.measure?.id       ?? p.measureId ?? p.Bootcamp?.id ?? '',
      fundingType:       p.fundingType       ?? p.fund ?? '',
      voucher:           p.voucher           ?? '',
      agency:            p.agency            ?? p.ag ?? '',
      voucherValidUntil: p.voucherValidUntil ?? '',
      fileCompleteness:  String(p.fileCompleteness ?? p.akte ?? 0),
      status:            p.status            ?? 'enrolled',
      password:          '',
    });
    setShowPass(false);
    setFormErr(null);
    setOpen(true);
    await ensureBootcamps();
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const regeneratePassword = () => {
    set('password', genPassword());
    setShowPass(true);
  };

  const submit = async () => {
    setFormErr(null);
    if (!form.name.trim()) {
      setFormErr(de ? 'Name ist erforderlich.' : 'Name is required.');
      return;
    }
    if (!editId && !form.email.trim()) {
      setFormErr(de ? 'E-Mail ist erforderlich.' : 'Email is required.');
      return;
    }
    if (!editId && !form.password.trim()) {
      setFormErr(de ? 'Passwort ist erforderlich.' : 'Password is required.');
      return;
    }
    setSaving(true);
    const payload: any = {
      name:              form.name.trim(),
      contact:           form.email.trim()             || undefined,
      phone:             form.phone.trim()             || undefined,
      measureId:         form.measureId                || undefined,
      fundingType:       form.fundingType.trim()       || undefined,
      voucher:           form.voucher.trim()           || undefined,
      agency:            form.agency.trim()            || undefined,
      voucherValidUntil: form.voucherValidUntil.trim() || undefined,
      fileCompleteness:  Number(form.fileCompleteness) || 0,
      status:            form.status                   || 'enrolled',
    };
    if (!editId) {
      payload.email    = form.email.trim();
      payload.password = form.password.trim();
      payload.sendWelcomeEmail = true;
    } else if (form.password.trim()) {
      payload.password = form.password.trim();
    }
    try {
      if (editId) {
        await api(`/participants/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/participants', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpen(false);
      setEditId(null);
      setLoading(true);
      await load();
      toast.success(editId
        ? (de ? 'Teilnehmer aktualisiert!' : 'Participant updated!')
        : (de ? 'Teilnehmer eingeschrieben & E-Mail gesendet!' : 'Participant enrolled & email sent!'));
    } catch (e: any) {
      setFormErr(e?.message || (de ? 'Fehler beim Speichern.' : 'Failed to save participant'));
      toast.error(de ? 'Fehler beim Speichern.' : 'Save failed.');
    } finally { setSaving(false); }
  };

  const remove = async (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`${de ? 'Löschen' : 'Delete'} ${p.name}?`)) return;
    try {
      const token = getToken();
      await fetch(`${API}/participants/${p.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setLoading(true);
      await load();
      toast.success(de ? 'Teilnehmer gelöscht.' : 'Participant deleted.');
    } catch (err) {
      console.error('delete participant failed', err);
      toast.error(de ? 'Fehler beim Löschen.' : 'Delete failed.');
    }
  };

  // ===== EXPORT EXCEL =====
  const exportExcel = () => {
    const data = rows.map((p) => ({
      [de ? 'Name'           : 'Name']:     p.name ?? '',
      [de ? 'E-Mail'         : 'Email']:    p.contact ?? '',
      [de ? 'Telefon'        : 'Phone']:    p.phone ?? '',
      [de ? 'Bootcamp'       : 'Bootcamp']: translateText(p.measure?.name ?? p.m ?? '', lang),
      [de ? 'Status'         : 'Status']:   p.status ?? '',
      [de ? 'Förderung'      : 'Funding']:  p.fundingType ?? p.fund ?? '',
      [de ? 'Gutscheinnummer': 'Voucher']:  p.voucher ?? '',
      [de ? 'Gültig bis'     : 'Valid until']: p.voucherValidUntil ?? '',
      [de ? 'Agentur'        : 'Agency']:   p.agency ?? p.ag ?? '',
      [de ? 'Akte %'         : 'File %']:   p.fileCompleteness ?? p.akte ?? 0,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, de ? 'Teilnehmer' : 'Participants');
    ws['!cols'] = [
      { wch: 25 }, { wch: 28 }, { wch: 18 },
      { wch: 25 }, { wch: 14 }, { wch: 20 },
      { wch: 18 }, { wch: 14 }, { wch: 22 }, { wch: 8 },
    ];
    XLSX.writeFile(wb, `participants_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ===== IMPORT EXCEL =====
  const importExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb     = XLSX.read(buffer, { type: 'array' });
      const ws     = wb.Sheets[wb.SheetNames[0]];
      const data   = XLSX.utils.sheet_to_json<any>(ws, { defval: '' });
      let imported = 0, failed = 0;
      for (const row of data) {
        const name = row['Name'] ?? row['name'] ?? '';
        if (!String(name).trim()) continue;
        const contact     = row['E-Mail']        ?? row['Email']   ?? row['email']   ?? '';
        const phone       = row['Telefon']        ?? row['Phone']   ?? row['phone']   ?? '';
        const status      = row['Status']         ?? row['status']  ?? 'enrolled';
        const fundingType = row['Förderung']       ?? row['Funding'] ?? row['funding'] ?? '';
        const voucher     = row['Gutscheinnummer'] ?? row['Voucher'] ?? row['voucher'] ?? '';
        const voucherValidUntil = row['Gültig bis'] ?? row['Valid until'] ?? '';
        const agency      = row['Agentur']        ?? row['Agency']  ?? row['agency']  ?? '';
        try {
          await api('/participants', {
            method: 'POST',
            body: JSON.stringify({
              name:        String(name).trim(),
              contact:     String(contact).trim()     || undefined,
              phone:       String(phone).trim()       || undefined,
              status:      String(status).trim()      || 'enrolled',
              fundingType: String(fundingType).trim() || undefined,
              voucher:     String(voucher).trim()     || undefined,
              voucherValidUntil: String(voucherValidUntil).trim() || undefined,
              agency:      String(agency).trim()      || undefined,
            }),
          });
          imported++;
        } catch { failed++; }
      }
      alert(de
        ? `Import abgeschlossen: ${imported} importiert, ${failed} fehlgeschlagen.`
        : `Import done: ${imported} imported, ${failed} failed.`);
      await load();
    } catch (err) {
      console.error('Import error:', err);
      alert(de ? 'Import fehlgeschlagen.' : 'Import failed.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  if (sel !== null) return <Akte t0={rows[sel]} back={() => setSel(null)} />;

  return (
    <div className="card" style={{ padding: '19px 8px 8px' }}>
      <div className="card-head" style={{ padding: '0 13px' }}>
        <div className="card-title">{t('part_count')} · {rows.length}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input ref={importRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={importExcel} />
          <button className="btn btn-ghost" style={{ padding: '8px 13px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}
            disabled={importing} onClick={() => importRef.current?.click()}>
            <Upload size={14} /> {importing ? '...' : (de ? 'Importieren' : 'Import')}
          </button>
          <button className="btn btn-ghost" style={{ padding: '8px 13px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={exportExcel} disabled={rows.length === 0}>
            <Download size={14} /> {de ? 'Exportieren' : 'Export'}
          </button>
          <button className="btn btn-primary" style={{ padding: '8px 14px' }} onClick={openForm}>
            <Plus size={15} /> {t('enroll')}
          </button>
        </div>
      </div>

      {loading && <div style={{ padding: 20, color: C.muted, fontSize: 13 }}>...</div>}
      {error   && <div style={{ padding: 20, color: C.rose,  fontSize: 13 }}>{error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div style={{ padding: 20, color: C.muted, fontSize: 13 }}>{t('part_count')}: 0</div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="scroll-x">
          <table>
            <thead>
              <tr>
                <th>{t('col_name')}</th>
                <th className="hide-mobile">{t('col_meas')}</th>
                <th>{t('col_status')}</th>
                <th className="hide-mobile">{t('col_fund')}</th>
                <th>{t('col_file')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => {
                const file     = p.fileCompleteness ?? p.akte ?? 0;
                const bootcamp = translateText(p.measure?.name ?? p.Bootcamp?.name ?? p.m ?? '', lang) || '—';
                const funding  = p.fundingType ?? p.fund ?? '—';
                const sub      = p.contact ?? p.ag ?? '';
                return (
                  <tr key={p.id ?? i} className="row" onClick={() => setSel(i)}>
                    <td>
                      <div className="cell-user">
                        <Avatar n={p.name} c={p.c} />
                        <div>
                          <div className="cell-name">{p.name}</div>
                          <div className="cell-sub hide-mobile">{sub}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile">{bootcamp}</td>
                    <td><Badge s={p.status} /></td>
                    <td className="hide-mobile">{funding}</td>
                    <td style={{ width: 130 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ flex: 1 }}>
                          <Bar2 pct={file} kind={file === 100 ? 'done' : file < 70 ? 'low' : ''} />
                        </div>
                        <span className="mono" style={{ fontSize: 11.5, fontWeight: 600 }}>{file}%</span>
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button onClick={(e) => openEdit(p, e)} style={iconBtn} title="Edit">
                          <Pencil size={14} color={C.muted} />
                        </button>
                        <button onClick={(e) => remove(p, e)} style={iconBtn} title="Delete">
                          <Trash2 size={14} color={C.muted} />
                        </button>
                        <ChevronRight size={14} color={C.muted} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== ENROLLMENT FORM MODAL ===== */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 520, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editId
                  ? (de ? 'Teilnehmer bearbeiten' : 'Edit participant')
                  : (de ? 'Neuen Teilnehmer einschreiben' : 'Enroll new participant')}
              </div>
              <button onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* ── SECTION 1: Contact Information ── */}
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 }}>
                {de ? '1 · Kontaktinformationen' : '1 · Contact information'}
              </div>

              {/* Name */}
              <label style={lbl}>{de ? 'Vollständiger Name *' : 'Full name *'}
                <input value={form.name} onChange={(e) => set('name', e.target.value)}
                  style={inp} placeholder={de ? 'Vor- und Nachname' : 'Full name'} autoFocus />
              </label>

              {/* Official Email */}
              <label style={lbl}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Mail size={11} />
                  {de ? 'Offizielle E-Mail (Microsoft-Lizenz) *' : 'Official email (Microsoft license) *'}
                </span>
                <input
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  style={inp}
                  placeholder="vorname.nachname@firma.de"
                  type="email"
                />
                <span style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                  {de ? 'Die vom IT-Admin zugewiesene Microsoft-E-Mail' : "The Microsoft email assigned by IT admin"}
                </span>
              </label>

              {/* Phone */}
              <label style={lbl}>{de ? 'Telefon' : 'Phone'}
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                  style={inp} placeholder="+49 123 456789" />
              </label>

              {/* ── SECTION 2: Login Credentials ── */}
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 6, marginBottom: 2 }}>
                {de ? '2 · Login-Zugangsdaten' : '2 · Login credentials'}
              </div>

              <div style={{ padding: '14px', borderRadius: 10, background: C.iris + '08', border: `1px solid ${C.iris + '30'}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.iris, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={13} /> {de ? 'Zugang zum Teilnehmer-Portal' : 'Participant portal access'}
                </div>

                {/* Email (inherited) */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
                    {de ? 'Benutzername (E-Mail)' : 'Username (email)'}
                  </div>
                  <div style={{ padding: '9px 12px', borderRadius: 8, background: C.soft, fontSize: 13, color: form.email ? C.ink : C.muted, fontWeight: form.email ? 500 : 400 }}>
                    {form.email || (de ? 'Wird aus Schritt 1 übernommen…' : 'Inherited from step 1…')}
                  </div>
                </div>

                {/* Auto-generated password */}
                <div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
                    {de ? 'Automatisch generiertes Passwort' : 'Auto-generated password'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1, padding: '9px 12px', borderRadius: 8, background: C.soft, fontSize: 13, fontFamily: 'monospace', fontWeight: 600, letterSpacing: 1, color: C.ink }}>
                      {showPass ? form.password : '••••••••••••'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      style={{ ...iconBtn, padding: '8px 10px', borderRadius: 8, background: C.soft }}
                      title={de ? 'Anzeigen/Verbergen' : 'Show/Hide'}
                    >
                      {showPass ? '🙈' : '👁'}
                    </button>
                    <button
                      type="button"
                      onClick={regeneratePassword}
                      style={{ ...iconBtn, padding: '8px 10px', borderRadius: 8, background: C.iris + '15', color: C.iris, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}
                      title={de ? 'Neu generieren' : 'Regenerate'}
                    >
                      <RefreshCw size={13} /> {de ? 'Neu' : 'New'}
                    </button>
                  </div>
                  {!editId && (
                    <div style={{ fontSize: 11, color: C.mint, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                      ✉ {de ? 'Zugangsdaten werden automatisch per E-Mail gesendet.' : 'Credentials will be sent automatically by email.'}
                    </div>
                  )}
                </div>

                {/* Edit: optional new password */}
                {editId && (
                  <div style={{ marginTop: 10 }}>
                    <label style={lbl}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Lock size={11} /> {de ? 'Neues Passwort (optional)' : 'New password (optional)'}
                      </span>
                      <input value={form.password} onChange={(e) => set('password', e.target.value)}
                        style={inp} placeholder={de ? 'Leer lassen = unverändert' : 'Leave empty = unchanged'} type="password" />
                    </label>
                  </div>
                )}
              </div>

              {/* ── SECTION 3: Bootcamp & Funding ── */}
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 6, marginBottom: 2 }}>
                {de ? '3 · Bootcamp & Förderung' : '3 · Bootcamp & funding'}
              </div>

              {/* Bootcamp */}
              <label style={lbl}>{de ? 'Bootcamp / Maßnahme' : 'Bootcamp / Measure'}
                <select value={form.measureId} onChange={(e) => set('measureId', e.target.value)} style={inp}>
                  <option value="">{de ? '— Bitte wählen —' : '— Select —'}</option>
                  {Bootcamps.map((m) => (
                    <option key={m.id} value={m.id}>{translateText(m.name, lang)}</option>
                  ))}
                </select>
              </label>

              {/* Status */}
              <label style={lbl}>{de ? 'Status' : 'Status'}
                <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inp}>
                  <option value="enrolled">{de ? 'Eingeschrieben' : 'Enrolled'}</option>
                  <option value="active">{de ? 'Aktiv' : 'Active'}</option>
                  <option value="completed">{de ? 'Abgeschlossen' : 'Completed'}</option>
                  <option value="dropped">{de ? 'Abgebrochen' : 'Dropped'}</option>
                  <option value="no_show">{de ? 'Nicht angetreten' : 'No-show'}</option>
                </select>
              </label>

              {/* Funding */}
              <label style={lbl}>{de ? 'Förderung' : 'Funding'}
                <select value={form.fundingType} onChange={(e) => set('fundingType', e.target.value)} style={inp}>
                  <option value="">{de ? '— Keine —' : '— None —'}</option>
                  <option value="Bildungsgutschein">Bildungsgutschein</option>
                  <option value="AVGS">AVGS</option>
                  <option value="Selbstzahler">{de ? 'Selbstzahler' : 'Self-paying'}</option>
                  <option value="Betrieb">{de ? 'Betrieb' : 'Employer'}</option>
                </select>
              </label>

              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Gutscheinnummer' : 'Voucher number'}
                  <input value={form.voucher} onChange={(e) => set('voucher', e.target.value)}
                    style={inp} placeholder="BGS-..." />
                </label>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Gültig bis' : 'Valid until'}
                  <input value={form.voucherValidUntil} onChange={(e) => set('voucherValidUntil', e.target.value)}
                    style={inp} placeholder="31.12.2026" />
                </label>
              </div>

              <label style={lbl}>{de ? 'Agentur / Jobcenter' : 'Agency / Jobcenter'}
                <input value={form.agency} onChange={(e) => set('agency', e.target.value)}
                  style={inp} placeholder="Jobcenter Hamburg" />
              </label>

              {/* Error */}
              {formErr && (
                <div style={{ fontSize: 12.5, color: C.rose, padding: '8px 12px', borderRadius: 8, background: C.rose + '10' }}>
                  {formErr}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving} onClick={() => setOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 18px' }}
                  disabled={saving} onClick={submit}>
                  {saving ? '...' : (editId ? (de ? 'Speichern' : 'Save') : (de ? 'Einschreiben' : 'Enroll'))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 50, padding: 16,
};
const lbl: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 5,
  fontSize: 12.5, fontWeight: 600, color: '#475569',
};
const inp: React.CSSProperties = {
  padding: '9px 12px', borderRadius: 9, border: '1px solid #E2E8F0',
  fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
};
const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 5, display: 'grid', placeItems: 'center', borderRadius: 6,
};

import React, { useState, useEffect } from 'react';
import { translateText } from '../../lib/translateName';
import { ChevronRight, Plus, X, Pencil, Trash2, Lock, Mail } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Bar2 } from '../../components/Bar';
import { api, getToken } from '../../lib/api';
import Akte from './Akte';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

export default function Participants() {
  const { t, lang } = useApp();
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

  const [form, setForm] = useState({
    name: '', contact: '', phone: '', measureId: '', fundingType: '',
    voucher: '', agency: '', voucherValidUntil: '',
    fileCompleteness: '0', status: 'enrolled',
    email: '', password: '',
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
    setForm({
      name: '', contact: '', phone: '', measureId: '', fundingType: '',
      voucher: '', agency: '', voucherValidUntil: '',
      fileCompleteness: '0', status: 'enrolled',
      email: '', password: '',
    });
    setFormErr(null);
    setOpen(true);
    await ensureBootcamps();
  };

  const openEdit = async (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditId(p.id);
    setForm({
      name:              p.name              ?? '',
      contact:           p.contact           ?? '',
      phone:             p.phone             ?? '',
      measureId:         p.measure?.id       ?? p.measureId ?? p.Bootcamp?.id ?? '',
      fundingType:       p.fundingType       ?? p.fund ?? '',
      voucher:           p.voucher           ?? '',
      agency:            p.agency            ?? p.ag ?? '',
      voucherValidUntil: p.voucherValidUntil ?? '',
      fileCompleteness:  String(p.fileCompleteness ?? p.akte ?? 0),
      status:            p.status            ?? 'enrolled',
      email:             '',
      password:          '',
    });
    setFormErr(null);
    setOpen(true);
    await ensureBootcamps();
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
      contact:           form.contact.trim()           || undefined,
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
    } catch (e: any) {
      setFormErr(e?.message || (de ? 'Fehler beim Speichern.' : 'Failed to save participant'));
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
    } catch (err) { console.error('delete participant failed', err); }
  };

  if (sel !== null) return <Akte t0={rows[sel]} back={() => setSel(null)} />;

  return (
    <div className="card" style={{ padding: '19px 8px 8px' }}>
      <div className="card-head" style={{ padding: '0 13px' }}>
        <div className="card-title">{t('part_count')} · {rows.length}</div>
        <button className="btn btn-primary" style={{ padding: '8px 14px' }} onClick={openForm}>
          <Plus size={15} /> {t('enroll')}
        </button>
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

      {/* ===== FORM MODAL ===== */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 520, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
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

              {/* Name */}
              <label style={lbl}>{de ? 'Name *' : 'Name *'}
                <input value={form.name} onChange={(e) => set('name', e.target.value)}
                  style={inp} placeholder={de ? 'Vor- und Nachname' : 'Full name'} autoFocus />
              </label>

              {/* Login credentials — only for new participants */}
              {!editId && (
                <div style={{ padding: '14px', borderRadius: 10, background: C.iris + '08', border: `1px solid ${C.iris}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.iris, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={13} /> {de ? 'Login-Zugangsdaten (für Teilnehmer-Portal)' : 'Login credentials (for participant portal)'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label style={lbl}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Mail size={11} /> {de ? 'E-Mail / Gmail *' : 'Email / Gmail *'}
                      </span>
                      <input value={form.email} onChange={(e) => set('email', e.target.value)}
                        style={inp} placeholder="name@gmail.com" type="email" />
                    </label>
                    <label style={lbl}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Lock size={11} /> {de ? 'Passwort *' : 'Password *'}
                      </span>
                      <input value={form.password} onChange={(e) => set('password', e.target.value)}
                        style={inp} placeholder={de ? 'Min. 6 Zeichen' : 'Min. 6 characters'} type="password" />
                    </label>
                  </div>
                </div>
              )}

              {/* Edit: optional password change */}
              {editId && (
                <label style={lbl}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Lock size={11} /> {de ? 'Neues Passwort (optional)' : 'New password (optional)'}
                  </span>
                  <input value={form.password} onChange={(e) => set('password', e.target.value)}
                    style={inp} placeholder={de ? 'Leer lassen = unverändert' : 'Leave empty = unchanged'} type="password" />
                </label>
              )}

              {/* Contact */}
              <label style={lbl}>{de ? 'Kontakt (E-Mail/Tel.)' : 'Contact (email/phone)'}
                <input value={form.contact} onChange={(e) => set('contact', e.target.value)}
                  style={inp} placeholder="email@example.com" />
              </label>

              {/* Phone */}
              <label style={lbl}>{de ? 'Telefon' : 'Phone'}
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                  style={inp} placeholder="+49 123 456789" />
              </label>

              {/* Bootcamp */}
              <label style={lbl}>{de ? 'Bootcamp / Maßnahme' : 'Bootcamp / Measure'}
                <select value={form.measureId} onChange={(e) => set('measureId', e.target.value)} style={inp}>
                  <option value="">{de ? '— Bitte wählen —' : '— Select —'}</option>
                  {Bootcamps.map((m) => (
                    <option key={m.id} value={m.id}>
                      {translateText(m.name, lang)}
                    </option>
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

              {formErr && (
                <div style={{ fontSize: 12.5, color: C.rose, padding: '8px 12px', borderRadius: 8, background: C.rose + '10' }}>
                  {formErr}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving} onClick={() => setOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
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
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16,
};
const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 4, display: 'grid', placeItems: 'center',
};
const lbl: React.CSSProperties = { fontSize: 12.5, color: '#334155', display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = {
  marginTop: 5, padding: '9px 11px', borderRadius: 9,
  border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', width: '100%',
};


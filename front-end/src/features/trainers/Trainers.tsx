import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { translateText } from '../../lib/translateName';
import {
  Plus, AlertTriangle, ShieldCheck, X, Pencil, Trash2,
  FileCheck2, Eye, EyeOff, Mail, Phone, Award, BookOpen,
  CheckCircle2, Clock, User, BadgeCheck, Calendar, Download, RefreshCw
} from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { api, getToken } from '../../lib/api';
import { useToast } from '../../components/ToastSystem';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

export default function Trainers() {
  const { t, lang } = useApp();
  const de = lang === 'de';
  const toast = useToast();

  const [rows,    setRows]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Create
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [form,    setForm]    = useState({ name: '', email: '', password: '', qualificationArea: '' });
  const [showPass, setShowPass] = useState(false);

  // Edit
  const [editOpen,   setEditOpen]   = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm,   setEditForm]   = useState<any>({
    id: '', name: '', qualificationArea: '', qualificationStatus: 'incomplete', expiry: '',
  });

  // ===== VIEW PROFILE =====
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [profileData,    setProfileData]    = useState<any>(null);
  const [profileQuals,   setProfileQuals]   = useState<any[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);

  const load = async () => {
    try {
      const data = await api<any[]>('/trainers');
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load trainers');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set  = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setE = (k: string, v: string) => setEditForm((f: any) => ({ ...f, [k]: v }));

  // ===== Auto-generate password =====
  const genPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
    const pwd = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm((f) => ({ ...f, password: pwd }));
    setShowPass(true);
  };

  // ===== Open add form with auto-generated password =====
  const openAddForm = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#';
    const pwd = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm({ name: '', email: '', password: pwd, qualificationArea: '' });
    setShowPass(false);
    setFormErr(null);
    setOpen(true);
  };

  // ===== Create Trainer =====
  const submit = async () => {
    setFormErr(null);
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setFormErr(de
        ? 'Name, E-Mail und Passwort (min. 6 Zeichen) sind erforderlich.'
        : 'Name, email and a password of at least 6 characters are required.');
      return;
    }
    setSaving(true);
    try {
      await api('/users', {
        method: 'POST',
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: 'trainer' }),
      });
      await api('/trainers', {
        method: 'POST',
        body: JSON.stringify({ name: form.name.trim(), qualificationArea: form.qualificationArea.trim() || undefined, qualificationStatus: 'incomplete', email: form.email.trim(), password: form.password }),
      });
      setOpen(false);
      setForm({ name: '', email: '', password: '', qualificationArea: '' });
      setLoading(true);
      await load();
      toast.success(de ? 'Trainer wurde hinzugefügt!' : 'Trainer added!');
    } catch (e: any) {
      setFormErr(e?.message || (de ? 'Fehler beim Speichern.' : 'Save failed.'));
      toast.error(de ? 'Fehler beim Speichern.' : 'Save failed.');
    } finally { setSaving(false); }
  };

  // ===== Edit =====
  const startEdit = (d: any) => {
    setEditForm({
      id:                    d.id,
      name:                  d.name               ?? '',
      qualificationArea:     d.qualificationArea  ?? '',
      qualificationStatus:   d.qualificationStatus ?? 'incomplete',
      expiry:                d.expiry             ?? '',
    });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    setEditSaving(true);
    try {
      await api(`/trainers/${editForm.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name:                editForm.name.trim()              || undefined,
          qualificationArea:   editForm.qualificationArea.trim() || undefined,
          qualificationStatus: editForm.qualificationStatus,
          expiry:              editForm.expiry.trim()            || undefined,
        }),
      });
      setEditOpen(false);
      await load();
      toast.success(de ? 'Trainer wurde aktualisiert!' : 'Trainer updated!');
    } catch (e) {
      console.error('edit trainer failed', e);
      toast.error(de ? 'Fehler beim Speichern.' : 'Save failed.');
    } finally { setEditSaving(false); }
  };

  // ===== Delete =====
  const deleteTrainer = async (id: string) => {
    if (!confirm(de ? 'Diesen Trainer löschen?' : 'Delete this trainer?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/trainers/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      await load();
      toast.success(de ? 'Trainer gelöscht.' : 'Trainer deleted.');
    } catch (e) { console.error('delete trainer failed', e); }
  };

  // ===== View Profile =====
  const openProfile = async (d: any) => {
    setProfileData(d);
    setProfileOpen(true);
    setProfileLoading(true);
    try {
      const quals = await api<any[]>(`/trainer-qualifications?trainerId=${d.id}`).catch(() => []);
      setProfileQuals(Array.isArray(quals) ? quals : []);
    } catch { setProfileQuals([]); }
    finally { setProfileLoading(false); }
  };

  // ===== Export Excel =====
  const exportExcel = () => {
    const data = rows.map((d) => ({
      [de ? 'Name'          : 'Name']:            d.name ?? '',
      [de ? 'E-Mail'        : 'Email']:           d.email ?? '',
      [de ? 'Zugelassen für': 'Approved for']:    translateText(d.qualificationArea ?? '', lang) || '',
      [de ? 'Status'        : 'Status']:          d.qualificationStatus ?? '',
      [de ? 'Nachweis'      : 'Proof/Expiry']:    d.expiry ?? '',
     [de ? 'CV'            : 'CV']:              d.cvRef ? 'Yes' : 'No',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, de ? 'Trainer' : 'Trainers');
    ws['!cols'] = [{ wch: 22 }, { wch: 28 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 6 }];
    XLSX.writeFile(wb, `trainers_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="card" style={{ padding: '19px 8px 8px' }}>
      <div className="card-head" style={{ padding: '0 13px' }}>
        <div className="card-title">{t('trainers')} · {rows.length}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ padding: '8px 13px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={exportExcel} disabled={rows.length === 0}>
            <Download size={14} /> {de ? 'Exportieren' : 'Export'}
          </button>
          <button className="btn btn-primary" style={{ padding: '8px 14px' }} onClick={openAddForm}>
            <Plus size={15} /> {t('add')}
          </button>
        </div>
      </div>

      {loading && <div style={{ padding: 20, color: C.muted, fontSize: 13 }}>…</div>}
      {error   && <div style={{ padding: 20, color: C.rose,  fontSize: 13 }}>{error}</div>}
      {!loading && !error && rows.length === 0 && (
        <div style={{ padding: 20, color: C.muted, fontSize: 13 }}>0</div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="scroll-x">
          <table>
            <thead>
              <tr>
                <th>{t('col_name')}</th>
                <th className="hide-mobile">{t('approved_for')}</th>
                <th>{t('t_file')}</th>
                <th className="hide-mobile">{t('t_proof')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d, i) => {
                const status = d.qualificationStatus ?? d.status ?? 'incomplete';
                const tone   = status === 'complete' ? 'g' : status === 'incomplete' ? 'r' : 'a';
                const area   = translateText(d.qualificationArea ?? '', lang) || '—';
                const proof  = d.expiry ?? '—';
                return (
                  <tr key={d.id ?? i} className="row">
                    <td>
                      <div className="cell-user">
                        <Avatar n={d.name} c={d.c} />
                        <div>
                          <div className="cell-name">{d.name}</div>
                          {d.email && <div className="cell-sub hide-mobile">{d.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile">{area}</td>
                    <td><Badge s={status} /></td>
                    <td className="hide-mobile">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: tone === 'g' ? C.inkSoft : tone === 'a' ? C.amber : C.rose, fontSize: 12.5, fontWeight: 500 }}>
                        {tone !== 'g' && <AlertTriangle size={14} />}{proof}
                      </span>
                    </td>

                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button onClick={() => openProfile(d)} title={de ? 'Profil ansehen' : 'View profile'} style={iconBtn}>
                          <Eye size={14} color={C.iris} />
                        </button>
                        <button onClick={() => startEdit(d)} title={de ? 'Bearbeiten' : 'Edit'} style={iconBtn}>
                          <Pencil size={14} color={C.muted} />
                        </button>
                        <button onClick={() => deleteTrainer(d.id)} title={de ? 'Löschen' : 'Delete'} style={iconBtn}>
                          <Trash2 size={14} color={C.muted} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== ADD TRAINER MODAL ===== */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 480, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {de ? 'Neuen Trainer hinzufügen' : 'Add new trainer'}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Section 1 */}
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                {de ? '1 · Kontaktinformationen' : '1 · Contact information'}
              </div>

              <label style={lbl}>{de ? 'Name *' : 'Name *'}
                <input value={form.name} onChange={(e) => set('name', e.target.value)}
                  style={inp} placeholder={de ? 'Vollständiger Name' : 'Full name'} autoFocus />
              </label>

              <label style={lbl}>{de ? 'E-Mail *' : 'Email *'}
                <input value={form.email} onChange={(e) => set('email', e.target.value)}
                  style={inp} placeholder="trainer@firma.de" type="email" />
              </label>

              {/* Section 2 */}
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 6 }}>
                {de ? '2 · Login-Zugangsdaten' : '2 · Login credentials'}
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: C.iris + '08', border: `1px solid ${C.iris}30` }}>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>
                  {de ? 'Benutzername (E-Mail)' : 'Username (email)'}
                </div>
                <div style={{ padding: '9px 12px', borderRadius: 8, background: C.soft, fontSize: 13, color: form.email ? C.ink : C.muted }}>
                  {form.email || (de ? 'Aus Schritt 1…' : 'From step 1…')}
                </div>

                <div style={{ fontSize: 12, color: C.muted, marginTop: 10, marginBottom: 6 }}>
                  {de ? 'Auto-generiertes Passwort' : 'Auto-generated password'}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, padding: '9px 12px', borderRadius: 8, background: C.soft, fontSize: 13, fontFamily: 'monospace', fontWeight: 600, letterSpacing: 1 }}>
                    {showPass ? form.password : '••••••••••••'}
                  </div>
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ ...iconBtn, padding: '8px 10px', borderRadius: 8, background: C.soft }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button type="button" onClick={genPassword}
                    style={{ ...iconBtn, padding: '8px 10px', borderRadius: 8, background: C.iris + '15', color: C.iris, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
                    <RefreshCw size={12} /> {de ? 'Neu' : 'New'}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: C.mint, marginTop: 6 }}>
                  ✉ {de ? 'Zugangsdaten werden per E-Mail gesendet.' : 'Credentials will be sent by email.'}
                </div>
              </div>

              {/* Section 3 */}
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 6 }}>
                {de ? '3 · Qualifikation' : '3 · Qualification'}
              </div>

              <label style={lbl}>{de ? 'Qualifikationsbereich' : 'Qualification area'}
                <input value={form.qualificationArea} onChange={(e) => set('qualificationArea', e.target.value)}
                  style={inp} placeholder={de ? 'z.B. Data Science, Web Development…' : 'e.g. Data Science, Web Development…'} />
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
                <button className="btn btn-primary" style={{ padding: '9px 18px' }}
                  disabled={saving} onClick={submit}>
                  {saving ? '...' : (de ? 'Hinzufügen' : 'Add')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== EDIT MODAL ===== */}
      {editOpen && (
        <div onClick={() => !editSaving && setEditOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 420, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title">{de ? 'Trainer bearbeiten' : 'Edit trainer'}</div>
              <button onClick={() => setEditOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Name' : 'Name'}
                <input value={editForm.name} onChange={(e) => setE('name', e.target.value)} style={inp} />
              </label>
              <label style={lbl}>{de ? 'Qualifikationsbereich' : 'Qualification area'}
                <input value={editForm.qualificationArea} onChange={(e) => setE('qualificationArea', e.target.value)} style={inp} />
              </label>
              <label style={lbl}>{de ? 'Status' : 'Status'}
                <select value={editForm.qualificationStatus} onChange={(e) => setE('qualificationStatus', e.target.value)} style={inp}>
                  <option value="incomplete">{de ? 'Unvollständig' : 'Incomplete'}</option>
                  <option value="complete">{de ? 'Vollständig' : 'Complete'}</option>
                  <option value="pending">{de ? 'Ausstehend' : 'Pending'}</option>
                </select>
              </label>
              <label style={lbl}>{de ? 'Ablaufdatum' : 'Expiry date'}
                <input value={editForm.expiry} onChange={(e) => setE('expiry', e.target.value)} style={inp} placeholder="31.12.2026" />
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  onClick={() => setEditOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 18px' }}
                  disabled={editSaving} onClick={submitEdit}>
                  {editSaving ? '...' : (de ? 'Speichern' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PROFILE MODAL ===== */}
      {profileOpen && profileData && (
        <div onClick={() => setProfileOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 500, padding: 0, overflow: 'hidden', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header gradient */}
            <div style={{ background: `linear-gradient(135deg, ${C.iris}, #8B7FF8)`, padding: '24px 24px 20px', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <User size={24} color="#fff" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{profileData.name}</div>
                  {profileData.email && <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={12} /> {profileData.email}</div>}
                </div>
                <button onClick={() => setProfileOpen(false)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}>
                  <X size={16} color="#fff" />
                </button>
              </div>
            </div>

            <div style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: de ? 'Qualifikationsbereich' : 'Qualification area', value: translateText(profileData.qualificationArea ?? '', lang) || '—', icon: <BookOpen size={13} /> },
                  { label: de ? 'Status' : 'Status', value: profileData.qualificationStatus ?? '—', icon: <BadgeCheck size={13} /> },
                  { label: de ? 'Ablaufdatum' : 'Expiry', value: profileData.expiry ?? '—', icon: <Calendar size={13} /> },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '10px 12px', borderRadius: 9, background: C.soft }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>{item.icon}{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Qualifications */}
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Award size={14} color={C.iris} /> {de ? 'Qualifikationen' : 'Qualifications'}
                </div>
                {profileLoading && <div style={{ fontSize: 12, color: C.muted }}>...</div>}
                {!profileLoading && profileQuals.length === 0 && (
                  <div style={{ fontSize: 12, color: C.muted }}>{de ? 'Keine Qualifikationen.' : 'No qualifications.'}</div>
                )}
                {!profileLoading && profileQuals.map((q, i) => (
                  <div key={i} style={{ padding: '9px 12px', borderRadius: 8, background: C.soft, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={14} color={C.mint} style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{q.title}</div>
                      {q.validUntil && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> {q.validUntil}</div>}
                    </div>
                  </div>
                ))}
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

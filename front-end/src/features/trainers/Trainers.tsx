import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { translateText } from '../../lib/translateName';
import {
  Plus, AlertTriangle, ShieldCheck, X, Pencil, Trash2,
  Upload, FileCheck2, Eye, Mail, Phone, Award, BookOpen,
  CheckCircle2, Clock, User, BadgeCheck, Calendar, Download
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

  // CV upload
  const [cvFile,    setCvFile]    = useState<File | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const cvInputRef   = useRef<HTMLInputElement | null>(null);
  const rowUploadRef = useRef<Record<string, HTMLInputElement | null>>({});

  // Edit
  const [editOpen,   setEditOpen]   = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm,   setEditForm]   = useState<any>({
    id: '', name: '', qualificationArea: '', qualificationStatus: 'incomplete', expiry: '',
  });

  // ===== VIEW PROFILE =====
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [profileData,  setProfileData]  = useState<any>(null);
  const [profileQuals, setProfileQuals] = useState<any[]>([]);
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

  // ===== Create =====
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
      const trainer = await api<any>('/trainers', {
        method: 'POST',
        body: JSON.stringify({ name: form.name.trim(), qualificationArea: form.qualificationArea.trim() || undefined, qualificationStatus: 'incomplete' }),
      });
      if (cvFile && trainer?.id) await uploadCv(trainer.id, cvFile);
      setOpen(false);
      setForm({ name: '', email: '', password: '', qualificationArea: '' });
      setCvFile(null);
      setLoading(true);
      await load();
      toast.success(de ? 'Trainer wurde hinzugefügt!' : 'Trainer added!');
    } catch (e: any) {
      setFormErr(e?.message || (de ? 'Fehler beim Speichern.' : 'Save failed.'));
      toast.error(de ? 'Fehler beim Speichern.' : 'Save failed.');
    } finally { setSaving(false); }
  };

  // ===== CV Upload =====
  const uploadCv = async (trainerId: string, file: File) => {
    setUploading(trainerId);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append('file', file);
      await fetch(`${API}/trainers/${trainerId}/cv`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      await load();
    } catch (e) { console.error('cv upload failed', e); }
    finally { setUploading(null); }
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
      toast.error(de ? 'Fehler beim Bearbeiten.' : 'Update failed.');
    }
    finally { setEditSaving(false); }
  };

  // ===== Delete =====
  const deleteTrainer = async (id: string) => {
    if (!confirm(de ? 'Diesen Trainer löschen?' : 'Delete this trainer?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/trainers/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      await load();
      toast.success(de ? 'Trainer wurde gelöscht.' : 'Trainer deleted.');
    } catch (e) {
      console.error('delete trainer failed', e);
      toast.error(de ? 'Fehler beim Löschen.' : 'Delete failed.');
    }
  };

  // ===== View Profile =====
  const openProfile = async (trainer: any) => {
    setProfileData(trainer);
    setProfileOpen(true);
    setProfileLoading(true);
    try {
      const quals = await api<any[]>(`/trainer-qualifications?trainerId=${trainer.id}`).catch(() => []);
      setProfileQuals(Array.isArray(quals) ? quals : []);
    } catch { setProfileQuals([]); }
    finally { setProfileLoading(false); }
  };


  // ===== EXPORT EXCEL =====
  const exportExcel = () => {
    const data = rows.map((d) => ({
      [de ? 'Name'              : 'Name']:           d.name ?? '',
      [de ? 'E-Mail'            : 'Email']:           d.email ?? d.contact ?? '',
      [de ? 'Zugelassen für'    : 'Approved for']:    translateText(d.qualificationArea ?? '', lang),
      [de ? 'Status'            : 'Status']:          d.qualificationStatus ?? '',
      [de ? 'Nachweis / Ablauf' : 'Proof / Expiry']:  d.expiry ?? '',
      [de ? 'CV vorhanden'      : 'CV on file']:      d.cvRef ? (de ? 'Ja' : 'Yes') : (de ? 'Nein' : 'No'),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, de ? 'Dozenten' : 'Trainers');

    ws['!cols'] = [
      { wch: 25 }, { wch: 28 }, { wch: 25 },
      { wch: 16 }, { wch: 16 }, { wch: 12 },
    ];

    XLSX.writeFile(wb, `trainers_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="card" style={{ padding: '19px 8px 8px' }}>
      <div className="card-head" style={{ padding: '0 13px' }}>
        <div className="card-title">{t('trainers')} · {rows.length}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '8px 13px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={exportExcel}
            disabled={rows.length === 0}
          >
            <Download size={14} /> {de ? 'Exportieren' : 'Export'}
          </button>
          <button className="btn btn-primary" style={{ padding: '8px 14px' }}
            onClick={() => setOpen(true)}>
            <Plus size={15} /> {t('add')}
          </button>
        </div>
      </div>

      {loading && <div style={{ padding: 20, color: C.muted, fontSize: 13 }}>...</div>}
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
                <th>CV</th>
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
                  <tr key={d.id ?? i} className="row" onClick={() => openProfile(d)}>
                    <td>
                      <div className="cell-user">
                        <Avatar n={d.name} c={d.c} />
                        <div className="cell-name">{d.name}</div>
                      </div>
                    </td>
                    <td className="hide-mobile">{area}</td>
                    <td><Badge s={status} /></td>
                    <td className="hide-mobile">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: tone === 'g' ? C.inkSoft : tone === 'a' ? C.amber : C.rose, fontSize: 12.5, fontWeight: 500 }}>
                        {tone !== 'g' && <AlertTriangle size={14} />}{proof}
                      </span>
                    </td>

                    {/* CV */}
                    <td onClick={(e) => e.stopPropagation()}>
                      {d.cvRef ? (
                        <button className="btn btn-ghost"
                          style={{ padding: '4px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={() => window.open(d.cvRef, '_blank')}>
                          <FileCheck2 size={12} color={C.mint} />
                          {de ? 'Öffnen' : 'Open'}
                        </button>
                      ) : (
                        <>
                          <button className="btn btn-ghost"
                            style={{ padding: '4px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            disabled={uploading === d.id}
                            onClick={() => rowUploadRef.current[d.id]?.click()}>
                            <Upload size={12} color={uploading === d.id ? C.muted : C.amber} />
                            {uploading === d.id ? '…' : (de ? 'CV hochladen' : 'Upload CV')}
                          </button>
                          <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                            ref={(el) => { rowUploadRef.current[d.id] = el; }}
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCv(d.id, f); e.target.value = ''; }} />
                        </>
                      )}
                    </td>

                    {/* Actions */}
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

      {/* ===== VIEW PROFILE MODAL ===== */}
      {profileOpen && profileData && (
        <div onClick={() => setProfileOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 520, padding: 0, overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${C.iris}, #7c3aed)`, padding: '24px 24px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button onClick={() => setProfileOpen(false)}
                  style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff', padding: 6, display: 'grid', placeItems: 'center' }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,.25)', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {profileData.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{profileData.name}</div>
                  {profileData.email && (
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Mail size={12} /> {profileData.email}
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: profileData.qualificationStatus === 'complete' ? C.mint : C.rose,
                      color: '#fff',
                    }}>
                      {profileData.qualificationStatus === 'complete'
                        ? (de ? 'Akte vollständig ✅' : 'File complete ✅')
                        : (de ? 'Akte unvollständig ⚠️' : 'File incomplete ⚠️')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px' }}>

              {/* Info rows */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { icon: <BadgeCheck size={14} color={C.iris} />, label: de ? 'Zugelassen für' : 'Approved for', val: translateText(profileData.qualificationArea ?? '', lang) || '—' },
                  { icon: <Calendar size={14} color={C.amber} />, label: de ? 'Nachweis / Ablauf' : 'Proof / Expiry', val: profileData.expiry || '—' },
                  { icon: <User size={14} color={C.mint} />,  label: de ? 'Status' : 'Status', val: profileData.qualificationStatus || '—' },
                  { icon: <Mail size={14} color={C.iris} />,  label: 'Email', val: profileData.email || profileData.contact || '—' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: C.soft, border: `1px solid ${C.line}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      {item.icon}
                      <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{item.val}</div>
                  </div>
                ))}
              </div>

              {/* CV */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileCheck2 size={14} color={C.iris} /> CV
                </div>
                {profileData.cvRef ? (
                  <button className="btn btn-primary"
                    style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => window.open(profileData.cvRef, '_blank')}>
                    <FileCheck2 size={14} /> {de ? 'CV öffnen' : 'Open CV'}
                  </button>
                ) : (
                  <div style={{ padding: '10px 14px', borderRadius: 9, background: C.rose + '10', border: `1px solid ${C.rose}`, fontSize: 12.5, color: C.rose }}>
                    ⚠️ {de ? 'Kein CV hochgeladen.' : 'No CV uploaded.'}
                  </div>
                )}
              </div>

              {/* Qualifications */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Award size={14} color={C.iris} />
                  {de ? 'Qualifikationen & Nachweise' : 'Qualifications & Proof'}
                  <span style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>· {profileQuals.length}</span>
                </div>

                {profileLoading && <div style={{ color: C.muted, fontSize: 13 }}>...</div>}

                {!profileLoading && profileQuals.length === 0 && (
                  <div style={{ padding: '10px 14px', borderRadius: 9, background: C.soft, fontSize: 12.5, color: C.muted }}>
                    {de ? 'Keine Qualifikationen hinterlegt.' : 'No qualifications on file.'}
                  </div>
                )}

                {!profileLoading && profileQuals.map((q, i) => (
                  <div key={q.id ?? i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 10, border: `1px solid ${C.line}`, marginBottom: 8, background: '#fff',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: q.type === 'approval' ? C.mint + '18' : C.iris + '12',
                      display: 'grid', placeItems: 'center',
                    }}>
                      {q.type === 'approval'
                        ? <ShieldCheck size={16} color={C.mint} />
                        : <BookOpen size={16} color={C.iris} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{q.title}</div>
                      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {q.type && <span style={{ textTransform: 'capitalize' }}>{q.type}</span>}
                        {q.approvedFor && <span style={{ color: C.iris }}>{translateText(q.approvedFor, lang)}</span>}
                        {q.validUntil  && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Clock size={10} /> {q.validUntil}</span>}
                      </div>
                    </div>
                    {q.fileRef && (
                      <button className="btn btn-ghost" style={{ padding: '4px 9px', fontSize: 11 }}
                        onClick={() => window.open(q.fileRef, '_blank')}>
                        <FileCheck2 size={11} /> {de ? 'Datei' : 'File'}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => { setProfileOpen(false); startEdit(profileData); }}>
                  <Pencil size={14} /> {de ? 'Bearbeiten' : 'Edit'}
                </button>
                <button className="btn btn-ghost"
                  style={{ padding: '9px 16px' }}
                  onClick={() => setProfileOpen(false)}>
                  {de ? 'Schließen' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE MODAL ===== */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 460, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {de ? 'Neuen Trainer hinzufügen' : 'Add new trainer'}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Name *' : 'Name *'}
                <input value={form.name} onChange={(e) => set('name', e.target.value)}
                  style={inp} placeholder={de ? 'Vor- und Nachname' : 'Full name'} autoFocus />
              </label>
              <label style={lbl}>{de ? 'E-Mail *' : 'Email *'}
                <input value={form.email} onChange={(e) => set('email', e.target.value)}
                  style={inp} placeholder="name@example.com" type="email" />
              </label>
              <label style={lbl}>{de ? 'Passwort *' : 'Password *'}
                <input value={form.password} onChange={(e) => set('password', e.target.value)}
                  style={inp} placeholder={de ? 'Min. 6 Zeichen' : 'Min. 6 characters'} type="password" />
              </label>
              <label style={lbl}>{de ? 'Zugelassen für (Fachgebiet)' : 'Approved for (subject)'}
                <input value={form.qualificationArea} onChange={(e) => set('qualificationArea', e.target.value)}
                  style={inp} placeholder={de ? 'z.B. Data Analytics' : 'e.g. Data Analytics'} />
              </label>
              <label style={lbl}>CV (PDF)
                <div style={{ display: 'flex', gap: 8, marginTop: 5, alignItems: 'center' }}>
                  <button type="button" className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}
                    onClick={() => cvInputRef.current?.click()}>
                    <Upload size={13} /> {cvFile ? cvFile.name : (de ? 'CV auswählen' : 'Select CV')}
                  </button>
                  {cvFile && <button onClick={() => setCvFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={14} /></button>}
                </div>
                <input ref={cvInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                  onChange={(e) => { setCvFile(e.target.files?.[0] ?? null); e.target.value = ''; }} />
              </label>
              {formErr && <div style={{ fontSize: 12.5, color: C.rose, padding: '8px 12px', borderRadius: 8, background: C.rose + '10' }}>{formErr}</div>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving} onClick={() => setOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {de ? 'Trainer bearbeiten' : 'Edit trainer'}
              </div>
              <button onClick={() => setEditOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Name' : 'Name'}
                <input value={editForm.name} onChange={(e) => setE('name', e.target.value)} style={inp} />
              </label>
              <label style={lbl}>{de ? 'Zugelassen für' : 'Approved for'}
                <input value={editForm.qualificationArea} onChange={(e) => setE('qualificationArea', e.target.value)}
                  style={inp} placeholder="Data Analytics" />
              </label>
              <label style={lbl}>{de ? 'Status' : 'Status'}
                <select value={editForm.qualificationStatus} onChange={(e) => setE('qualificationStatus', e.target.value)} style={inp}>
                  <option value="incomplete">{de ? 'Unvollständig' : 'Incomplete'}</option>
                  <option value="complete">{de ? 'Vollständig' : 'Complete'}</option>
                  <option value="pending">{de ? 'Ausstehend' : 'Pending'}</option>
                </select>
              </label>
              <label style={lbl}>{de ? 'Nachweis / Ablauf' : 'Proof / Expiry'}
                <input value={editForm.expiry} onChange={(e) => setE('expiry', e.target.value)}
                  style={inp} placeholder="09/23" />
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={editSaving} onClick={() => setEditOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={editSaving} onClick={submitEdit}>
                  {editSaving ? '...' : (de ? 'Speichern' : 'Save')}
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

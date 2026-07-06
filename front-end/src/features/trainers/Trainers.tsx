import React, { useState, useEffect, useRef } from 'react';
import { translateText } from '../../lib/translateName';
import { Plus, AlertTriangle, ShieldCheck, X, Pencil, Trash2, Upload, FileCheck2 } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

export default function Trainers() {
  const { t, lang } = useApp();
  const de = lang === 'de';
  const [rows, setRows]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // إنشاء
  const [open, setOpen]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [form, setForm]       = useState({ name: '', email: '', password: '', qualificationArea: '' });

  // CV upload في نموذج الإنشاء
  const [cvFile, setCvFile]         = useState<File | null>(null);
  const [uploading, setUploading]   = useState<string | null>(null);
  const cvInputRef                  = useRef<HTMLInputElement | null>(null);
  const rowUploadRef                = useRef<Record<string, HTMLInputElement | null>>({});

  // تعديل
  const [editOpen, setEditOpen]     = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm]     = useState<any>({
    id: '', name: '', qualificationArea: '', qualificationStatus: 'incomplete', expiry: '',
  });

  const load = async () => {
    try {
      const data = await api<any[]>('/trainers');
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const set  = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setE = (k: string, v: string) => setEditForm((f: any) => ({ ...f, [k]: v }));

  // ===== إنشاء Trainer =====
  const submit = async () => {
    setFormErr(null);
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setFormErr('Name, email and a password of at least 6 characters are required.');
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

      // رفع الـ CV لو موجود
      if (cvFile && trainer?.id) {
        await uploadCv(trainer.id, cvFile);
      }

      setOpen(false);
      setForm({ name: '', email: '', password: '', qualificationArea: '' });
      setCvFile(null);
      setLoading(true);
      await load();
    } catch (e: any) {
      setFormErr(e?.message || 'Failed to create trainer');
    } finally {
      setSaving(false);
    }
  };

  // ===== رفع CV =====
  const uploadCv = async (trainerId: string, file: File) => {
    setUploading(trainerId);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/trainers/${trainerId}/cv`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      if (!res.ok) throw new Error(`${res.status}`);
      await load();
    } catch {
      alert(de ? 'Upload fehlgeschlagen.' : 'Upload failed.');
    } finally {
      setUploading(null);
    }
  };

  // ===== تعديل =====
  const startEdit = (d: any) => {
    setEditForm({
      id:                  d.id,
      name:                d.name ?? '',
      qualificationArea:   d.qualificationArea ?? '',
      qualificationStatus: d.qualificationStatus ?? 'incomplete',
      expiry:              d.expiry ?? '',
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editForm.name.trim()) return;
    setEditSaving(true);
    try {
      await api(`/trainers/${editForm.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name:                editForm.name.trim(),
          qualificationArea:   editForm.qualificationArea.trim() || undefined,
          qualificationStatus: editForm.qualificationStatus,
          expiry:              editForm.expiry.trim() || undefined,
        }),
      });
      setEditOpen(false);
      await load();
    } catch (e) { console.error('edit trainer failed', e); }
    finally { setEditSaving(false); }
  };

  // ===== حذف =====
  const deleteTrainer = async (id: string) => {
    if (!confirm(de ? 'Diesen Trainer löschen?' : 'Delete this trainer?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/trainers/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      await load();
    } catch (e) { console.error('delete trainer failed', e); }
  };

  return (
    <div className="card" style={{ padding: '19px 8px 8px' }}>
      <div className="card-head" style={{ padding: '0 13px' }}>
        <div className="card-title">{t('trainers')} · {rows.length}</div>
        <button className="btn btn-primary" style={{ padding: '8px 14px' }} onClick={() => setOpen(true)}>
          <Plus size={15} /> {t('add')}
        </button>
      </div>

      {loading && <div style={{ padding: 20, color: C.muted, fontSize: 13 }}>…</div>}
      {error && <div style={{ padding: 20, color: C.rose, fontSize: 13 }}>{error}</div>}
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
                const area = translateText(d.qualificationArea ?? '', lang) || '—';
                const proof  = d.expiry ?? '—';
                return (
                  <tr key={d.id ?? i} className="row">
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

                    {/* CV column */}
                    <td onClick={(e) => e.stopPropagation()}>
                      {d.cvRef ? (
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '4px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          onClick={() => window.open(d.cvRef, '_blank')}
                        >
                          <FileCheck2 size={12} color={C.mint} />
                          {de ? 'Öffnen' : 'Open'}
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '4px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            disabled={uploading === d.id}
                            onClick={() => rowUploadRef.current[d.id]?.click()}
                          >
                            <Upload size={12} color={uploading === d.id ? C.muted : C.amber} />
                            {uploading === d.id ? '…' : (de ? 'CV hochladen' : 'Upload CV')}
                          </button>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            style={{ display: 'none' }}
                            ref={(el) => { rowUploadRef.current[d.id] = el; }}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) uploadCv(d.id, f);
                              e.target.value = '';
                            }}
                          />
                        </>
                      )}
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
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

      <div style={{ padding: 13, fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 7 }}>
        <ShieldCheck size={14} color={C.mint} /> {t('sperre')}
      </div>

      {/* ===== نموذج إنشاء ===== */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 440, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>{t('add')} — Trainer</div>
              <button onClick={() => !saving && setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>Name
                <input value={form.name} onChange={(e) => set('name', e.target.value)}
                  className="input" style={inp} placeholder="Dr. Elena Alvarez" />
              </label>

              <label style={lbl}>E-Mail (Login)
                <input value={form.email} onChange={(e) => set('email', e.target.value)}
                  className="input" style={inp} placeholder="trainer.elena@allinone.de" />
              </label>

              <label style={lbl}>Passwort
                <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)}
                  className="input" style={inp} placeholder="min. 6 Zeichen" />
              </label>

              <label style={lbl}>{t('approved_for')}
                <input value={form.qualificationArea} onChange={(e) => set('qualificationArea', e.target.value)}
                  className="input" style={inp} placeholder="Data Analytics" />
              </label>

              {/* CV Upload */}
              <div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 6 }}>
                  CV / {de ? 'Lebenslauf' : 'Résumé'} ({de ? 'optional' : 'optional'})
                </div>
                {cvFile ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10,
                    background: C.mint + '0D', border: `1px solid ${C.mint}`,
                  }}>
                    <FileCheck2 size={16} color={C.mint} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: C.mint }}>{cvFile.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                        {(cvFile.size / 1024).toFixed(0)} KB
                      </div>
                    </div>
                    <button
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}
                      onClick={() => setCvFile(null)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => cvInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${C.line}`, borderRadius: 10,
                      padding: '18px 16px', textAlign: 'center',
                      cursor: 'pointer', transition: 'all .2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.iris)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.line)}
                  >
                    <Upload size={20} color={C.muted} style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 13, color: C.inkSoft, fontWeight: 500 }}>
                      {de ? 'CV hochladen' : 'Upload CV'}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                      PDF, DOC, DOCX
                    </div>
                  </div>
                )}
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setCvFile(f);
                    e.target.value = '';
                  }}
                />
              </div>

              {formErr && <div style={{ color: C.rose, fontSize: 12.5 }}>{formErr}</div>}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving} onClick={() => { setOpen(false); setCvFile(null); }}>
                  {t('cancel') || 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={saving} onClick={submit}>
                  {saving ? '…' : (t('save') || 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== نموذج تعديل ===== */}
      {editOpen && (
        <div onClick={() => !editSaving && setEditOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 440, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>{de ? 'Trainer bearbeiten' : 'Edit trainer'}</div>
              <button onClick={() => !editSaving && setEditOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>Name
                <input value={editForm.name} onChange={(e) => setE('name', e.target.value)}
                  className="input" style={inp} />
              </label>

              <label style={lbl}>{t('approved_for')}
                <input value={editForm.qualificationArea} onChange={(e) => setE('qualificationArea', e.target.value)}
                  className="input" style={inp} placeholder="Data Analytics" />
              </label>

              <label style={lbl}>Status
                <select value={editForm.qualificationStatus} onChange={(e) => setE('qualificationStatus', e.target.value)}
                  className="input" style={inp}>
                  <option value="complete">{de ? 'Vollständig' : 'Complete'}</option>
                  <option value="incomplete">{de ? 'Unvollständig' : 'Incomplete'}</option>
                  <option value="expiring">{de ? 'Läuft ab' : 'Expiring'}</option>
                </select>
              </label>

              <label style={lbl}>{t('t_proof')}
                <input value={editForm.expiry} onChange={(e) => setE('expiry', e.target.value)}
                  className="input" style={inp} placeholder="09/2027" />
              </label>

              {/* CV Upload في التعديل */}
              <div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 6 }}>
                  {de ? 'CV hochladen / ersetzen' : 'Upload / replace CV'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px' }}
                    disabled={uploading === editForm.id}
                    onClick={() => rowUploadRef.current[`edit-${editForm.id}`]?.click()}
                  >
                    <Upload size={14} color={uploading === editForm.id ? C.muted : C.amber} />
                    {uploading === editForm.id ? '…' : (de ? 'CV hochladen' : 'Upload CV')}
                  </button>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    ref={(el) => { rowUploadRef.current[`edit-${editForm.id}`] = el; }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadCv(editForm.id, f);
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={editSaving} onClick={() => setEditOpen(false)}>
                  {t('cancel') || 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={editSaving} onClick={saveEdit}>
                  {editSaving ? '…' : (t('save') || 'Save')}
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
const lbl: React.CSSProperties = { fontSize: 12.5, color: C.inkSoft, display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = {
  width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9,
  border: `1px solid ${C.line}`, fontSize: 13, outline: 'none',
};
const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', padding: 3,
  display: 'grid', placeItems: 'center',
};


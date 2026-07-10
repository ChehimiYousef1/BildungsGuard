import React, { useState, useEffect, useRef } from 'react';
import { translateText } from '../../../lib/translateName';
import { CheckCircle2, BadgeCheck, Plus, X, Pencil, Trash2, FileCheck2, User, Mail, Upload, FileText } from 'lucide-react';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { api, getToken } from '../../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

const TYPES: { id: string; de: string; en: string }[] = [
  { id: 'qualification', de: 'Qualifikation', en: 'Qualification' },
  { id: 'license', de: 'Lizenz', en: 'License' },
  { id: 'contract', de: 'Vertrag', en: 'Contract' },
  { id: 'approval', de: 'Zulassung', en: 'Approval' },
];

export default function TrFile() {
  const { lang, user } = useApp();
  const de = lang === 'de';
  console.log('[TrainerFile] lang:', lang, '| web→de:', translateText('web', lang));
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ title: '', type: 'qualification', validUntil: '', approvedFor: '' });
  const [cvFile,     setCvFile]     = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvUrl,      setCvUrl]      = useState<string | null>(null);
  const cvRef = useRef<HTMLInputElement | null>(null);

  const typeLabel = (id?: string) => { const x = TYPES.find((y) => y.id === id); return x ? (de ? x.de : x.en) : id; };

  const load = async () => {
    try {
      const data = await api<any[]>('/trainer-qualifications');
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditId(null); setForm({ title: '', type: 'qualification', validUntil: '', approvedFor: '' }); setOpen(true); };
  const openEdit = (r: any) => { setEditId(r.id); setForm({ title: r.title ?? '', type: r.type ?? 'qualification', validUntil: r.validUntil ?? '', approvedFor: r.approvedFor ?? '' }); setOpen(true); };

  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload: any = {
      title: form.title.trim(),
      type: form.type,
      validUntil: form.validUntil.trim() || undefined,
      approvedFor: form.approvedFor.trim() || undefined,
      trainerName: user?.name || undefined,
      userId: user?.id || undefined,
    };
    try {
      if (editId) await api(`/trainer-qualifications/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      else await api('/trainer-qualifications', { method: 'POST', body: JSON.stringify(payload) });
      setOpen(false);
      setLoading(true);
      await load();
    } catch (e) { console.error('save qualification failed', e); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Diesen Eintrag löschen?' : 'Delete this entry?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/trainer-qualifications/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      setLoading(true);
      await load();
    } catch (e) { console.error('delete qualification failed', e); }
  };

  // اعتمادات التدريس = المؤهّلات التي فيها approvedFor
  const approvals = rows.filter((r) => r.approvedFor);

  

  

  

  const uploadCv = async (file: File) => {
    if (!user?.trainerId && !user?.id) return;
    const trainerId = user?.trainerId ?? user?.id;
    setCvUploading(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(API + '/trainers/' + trainerId + '/cv', {
        method: 'POST',
        headers: token ? { Authorization: 'Bearer ' + token } : undefined,
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setCvUrl(data.url ?? file.name);
      } else {
        alert(de ? 'Upload fehlgeschlagen.' : 'Upload failed.');
      }
    } catch (e) {
      console.error('cv upload failed', e);
    } finally {
      setCvUploading(false);
    }
  };

  return (
    <>
      {/* بطاقة بيانات المدرّب */}
      <div className="card" style={{ marginBottom: 15, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--grad)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
          {(user?.name || 'T').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} color={C.muted} /> {user?.name || (de ? 'Dozent' : 'Trainer')}</div>
          {user?.email && <div className="mono" style={{ fontSize: 12, color: C.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={12} /> {user.email}</div>}
        </div>
        <span className="badge" style={{ background: C.iris + '18', color: C.iris }}>{de ? 'Dozentenakte' : 'Trainer file'}</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* المؤهّلات */}
        <div className="card">
          <div className="card-head">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FileCheck2 size={15} color={C.iris} /> {de ? 'Qualifikationsnachweise' : 'Qualification proofs'} · {rows.length}</div>
            <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11.5 }} onClick={openCreate}><Plus size={13} /> {de ? 'Hinzufügen' : 'Add'}</button>
          </div>

          {loading && <div style={{ fontSize: 12.5, color: C.mutedLight, padding: '8px 0' }}>…</div>}
          {!loading && rows.length === 0 && <div style={{ fontSize: 12.5, color: C.mutedLight, padding: '8px 0' }}>{de ? 'Keine Nachweise. „Hinzufügen" klicken.' : 'No proofs yet. Click "Add".'}</div>}

          {!loading && rows.map((r) => (
            <div key={r.id} className="doc-row" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <CheckCircle2 size={16} color={C.mint} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{typeLabel(r.type)}</div>
              </div>
              <span className="mono" style={{ fontSize: 11.5, color: C.muted, flexShrink: 0 }}>{r.validUntil || (de ? 'unbefristet' : 'permanent')}</span>
              <button onClick={() => openEdit(r)} style={iconBtn}><Pencil size={12} color={C.muted} /></button>
              <button onClick={() => remove(r.id)} style={iconBtn}><Trash2 size={12} color={C.muted} /></button>
            </div>
          ))}
        </div>

        {/* معتمد للتدريس في */}
        <div className="card">
          <div className="card-head"><div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BadgeCheck size={15} color={C.mint} /> {de ? 'Zugelassen für' : 'Approved for'}</div></div>
          {approvals.length === 0 && <div style={{ fontSize: 12.5, color: C.mutedLight, padding: '8px 0' }}>{de ? 'Noch keine Fachgebiete. Fügen Sie „Zugelassen für" zu einem Nachweis hinzu.' : 'No subjects yet. Add "Approved for" to a proof.'}</div>}
          {approvals.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', gap: 9, alignItems: 'center', padding: '9px 0', borderTop: i ? `1px solid ${C.lineSoft}` : 'none' }}>
              <BadgeCheck size={16} color={C.mint} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{translateText(r.approvedFor, lang)}</span>
                <span style={{ fontSize: 11, color: C.mutedLight }}> · {r.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 460, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>{editId ? (de ? 'Nachweis bearbeiten' : 'Edit proof') : (de ? 'Qualifikationsnachweis' : 'Qualification proof')}</div>
              <button onClick={() => !saving && setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Titel / Nachweis' : 'Title / proof'}<input value={form.title} onChange={(e) => set('title', e.target.value)} style={inp} placeholder={de ? 'z.B. M.Sc. Data Science' : 'e.g. M.Sc. Data Science'} /></label>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Typ' : 'Type'}
                  <select value={form.type} onChange={(e) => set('type', e.target.value)} style={inp}>
                    {TYPES.map((x) => <option key={x.id} value={x.id}>{de ? x.de : x.en}</option>)}
                  </select>
                </label>
                <label style={{ ...lbl, width: 160 }}>{de ? 'Gültig bis' : 'Valid until'}<input value={form.validUntil} onChange={(e) => set('validUntil', e.target.value)} style={inp} placeholder={de ? 'unbefristet / 09/2027' : 'permanent / 09/2027'} /></label>
              </div>
              <label style={lbl}>{de ? 'Zugelassen für (Fachgebiet)' : 'Approved for (subject)'}<input value={form.approvedFor} onChange={(e) => set('approvedFor', e.target.value)} style={inp} placeholder={de ? 'z.B. Data Analytics' : 'e.g. Data Analytics'} /></label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }} disabled={saving} onClick={() => setOpen(false)}>{de ? 'Abbrechen' : 'Cancel'}</button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }} disabled={saving} onClick={submit}>{saving ? '…' : (de ? 'Speichern' : 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    {/* ===== CV UPLOAD CARD ===== */}
      <div className="card" style={{ marginTop: 15 }}>
        <div className="card-head">
          <div className="card-title">
            <FileText size={15} style={{ marginRight: 6 }} />
            {de ? 'Lebenslauf (CV)' : 'Curriculum Vitae (CV)'}
          </div>
        </div>
        <div style={{ padding: '12px 0' }}>
          <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCvFile(f); uploadCv(f); } }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px' }}
              disabled={cvUploading}
              onClick={() => cvRef.current?.click()}
            >
              <Upload size={15} />
              {cvUploading ? (de ? 'Wird hochgeladen...' : 'Uploading...') : (de ? 'CV hochladen' : 'Upload CV')}
            </button>
            {(cvFile || cvUrl) && (
              <span style={{ fontSize: 12, color: '#0FB6A0', display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle2 size={13} />
                {cvFile?.name || cvUrl}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 8 }}>
            {de ? 'Erlaubte Formate: PDF, DOC, DOCX' : 'Accepted formats: PDF, DOC, DOCX'}
          </div>
        </div>
      </div>
    
    </>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 };
const lbl: React.CSSProperties = { fontSize: 12.5, color: C.inkSoft, display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = { width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13, outline: 'none' };
const iconBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'grid', placeItems: 'center' };


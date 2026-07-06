import React, { useState, useEffect, useRef } from 'react';
import { File, Plus, X, Pencil, Trash2, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

const EDUCATION_OPTS = [
  { value: 'none',        de: 'Kein Abschluss',      en: 'No qualification' },
  { value: 'hauptschule', de: 'Hauptschulabschluss',  en: 'Secondary school' },
  { value: 'realschule',  de: 'Realschulabschluss',   en: 'Middle school' },
  { value: 'abitur',      de: 'Abitur',               en: 'High school' },
  { value: 'ausbildung',  de: 'Berufsausbildung',     en: 'Vocational training' },
  { value: 'bachelor',    de: 'Bachelor',              en: 'Bachelor' },
  { value: 'master',      de: 'Master / Diplom',       en: 'Master / Diploma' },
  { value: 'promotion',   de: 'Promotion',             en: 'PhD' },
];

export default function CVDocument({ participantId }: { participantId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';

  const [docs,    setDocs]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    education: '', experience: '', languages: '', skills: '', lastUpdated: '', notes: '',
  });

  const load = async () => {
    try {
      const all = await api<any[]>('/documents').catch(() => []);
      setDocs((Array.isArray(all) ? all : []).filter(
        (d) => d.type === 'CV' && d.participantId === participantId
      ));
    } catch { setDocs([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [participantId]);

  const openNew = () => {
    setEditId(null);
    setForm({ education: '', experience: '', languages: '', skills: '', lastUpdated: new Date().toLocaleDateString('de-DE'), notes: '' });
    setOpen(true);
  };

  const openEdit = (d: any) => {
    let extra: any = {};
    try { extra = d.responsible ? JSON.parse(d.responsible) : {}; } catch { extra = {}; }
    setEditId(d.id);
    setForm({
      education:   extra.education   ?? '',
      experience:  extra.experience  ?? '',
      languages:   extra.languages   ?? '',
      skills:      extra.skills      ?? '',
      lastUpdated: extra.lastUpdated ?? '',
      notes:       extra.notes       ?? '',
    });
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        type:          'CV',
        participantId,
        status:        'doc_ready',
        responsible:   JSON.stringify({
          education:   form.education,
          experience:  form.experience,
          languages:   form.languages,
          skills:      form.skills,
          lastUpdated: form.lastUpdated,
          notes:       form.notes,
        }),
      };
      if (editId) {
        await api(`/documents/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/documents', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpen(false);
      await load();
    } catch (e) {
      console.error('CV save failed', e);
      alert(de ? 'Fehler beim Speichern.' : 'Save failed.');
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'CV löschen?' : 'Delete CV?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/documents/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      await load();
    } catch (e) { console.error(e); }
  };

  const uploadFile = async (id: string, file: File) => {
    setUploading(id);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/documents/${id}/file`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      if (!res.ok) throw new Error(`${res.status}`);
      await load();
    } catch { alert(de ? 'Upload fehlgeschlagen.' : 'Upload failed.'); }
    finally { setUploading(null); }
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="card" style={{ marginTop: 15 }}>
      <div className="card-head">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <File size={15} color={C.iris} />
          {de ? 'Lebenslauf / CV (#7)' : 'CV / Résumé (#7)'} · {docs.length}
        </div>
        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={openNew}>
          <Plus size={13} /> {de ? 'CV hinzufügen' : 'Add CV'}
        </button>
      </div>

      {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}

      {!loading && docs.length === 0 && (
        <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>
          {de ? 'Kein CV hinterlegt.' : 'No CV on file.'}
        </div>
      )}

      {!loading && docs.map((d, i) => {
        let extra: any = {};
        try { extra = d.responsible ? JSON.parse(d.responsible) : {}; } catch {}
        const educOpt = EDUCATION_OPTS.find((e) => e.value === extra.education);
        return (
          <div key={d.id ?? i} style={{ padding: '12px 0', borderTop: i > 0 ? `1px solid ${C.lineSoft}` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: C.mint + '18', display: 'grid', placeItems: 'center' }}>
                <File size={17} color={C.mint} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {educOpt ? (de ? educOpt.de : educOpt.en) : (de ? 'Lebenslauf' : 'CV')}
                </div>
                {extra.lastUpdated && (
                  <div style={{ fontSize: 11.5, color: C.muted }}>{de ? 'Stand:' : 'Updated:'} {extra.lastUpdated}</div>
                )}
              </div>
              <span className="badge" style={{ background: C.mint + '18', color: C.mint, fontSize: 11 }}>
                {de ? 'Vorhanden ✅' : 'On file ✅'}
              </span>
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {[
                [de ? 'Abschluss' : 'Education', educOpt ? (de ? educOpt.de : educOpt.en) : null],
                [de ? 'Erfahrung' : 'Experience', extra.experience ? `${extra.experience} ${de ? 'Jahre' : 'yrs'}` : null],
                [de ? 'Sprachen' : 'Languages', extra.languages],
                [de ? 'Kenntnisse' : 'Skills', extra.skills],
              ].filter(([, v]) => v).map(([label, value]: any, j) => (
                <span key={j} style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 20, background: C.iris + '10', color: C.iris }}>
                  {label}: {value}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {d.fileRef ? (
                <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }}
                  onClick={() => window.open(d.fileRef, '_blank')}>
                  📎 {de ? 'Datei öffnen' : 'Open file'}
                </button>
              ) : (
                <>
                  <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
                    disabled={uploading === d.id}
                    onClick={() => fileRef.current?.click()}>
                    <Upload size={12} /> {uploading === d.id ? '…' : (de ? 'PDF hochladen' : 'Upload PDF')}
                  </button>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(d.id, f); e.target.value = ''; }} />
                </>
              )}
              <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={() => openEdit(d)}>
                <Pencil size={12} /> {de ? 'Bearbeiten' : 'Edit'}
              </button>
              <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12, color: C.rose, display: 'flex', alignItems: 'center', gap: 5 }}
                onClick={() => remove(d.id)}>
                <Trash2 size={12} /> {de ? 'Löschen' : 'Delete'}
              </button>
            </div>
          </div>
        );
      })}

      {/* MODAL */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 460, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editId ? (de ? 'CV bearbeiten' : 'Edit CV') : (de ? 'CV hinzufügen' : 'Add CV')}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Höchster Abschluss' : 'Highest qualification'}
                <select value={form.education} onChange={(e) => set('education', e.target.value)} style={inp}>
                  <option value="">—</option>
                  {EDUCATION_OPTS.map((o) => <option key={o.value} value={o.value}>{de ? o.de : o.en}</option>)}
                </select>
              </label>
              <label style={lbl}>{de ? 'Berufserfahrung (Jahre)' : 'Work experience (years)'}
                <input type="number" min="0" max="50" value={form.experience}
                  onChange={(e) => set('experience', e.target.value)} style={inp} placeholder="3" />
              </label>
              <label style={lbl}>{de ? 'Sprachen' : 'Languages'}
                <input value={form.languages} onChange={(e) => set('languages', e.target.value)}
                  style={inp} placeholder={de ? 'Deutsch, Englisch…' : 'German, English…'} />
              </label>
              <label style={lbl}>{de ? 'Kenntnisse / Skills' : 'Skills'}
                <input value={form.skills} onChange={(e) => set('skills', e.target.value)}
                  style={inp} placeholder="Excel, Python…" />
              </label>
              <label style={lbl}>{de ? 'Stand (Datum)' : 'Last updated'}
                <input value={form.lastUpdated} onChange={(e) => set('lastUpdated', e.target.value)}
                  style={inp} placeholder="TT.MM.JJJJ" />
              </label>
              <label style={lbl}>{de ? 'Notizen' : 'Notes'}
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
                  style={{ ...inp, minHeight: 70, resize: 'vertical' }} />
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving} onClick={() => setOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={saving} onClick={submit}>
                  {saving ? '…' : (de ? 'Speichern' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 };
const lbl: React.CSSProperties = { fontSize: 12.5, color: '#334155', display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = { width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' };
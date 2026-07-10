import React, { useState, useEffect, useRef } from 'react';
import { Award, Plus, X, Pencil, Trash2, Upload, CheckCircle2 } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

const CERT_TYPES = [
  { value: 'completion',    de: 'Abschlusszertifikat',    en: 'Completion certificate' },
  { value: 'participation', de: 'Teilnahmebescheinigung', en: 'Participation certificate' },
  { value: 'azav',          de: 'AZAV-Zertifikat',        en: 'AZAV certificate' },
  { value: 'qualification', de: 'Qualifikationsnachweis', en: 'Qualification certificate' },
  { value: 'other',         de: 'Sonstiges',              en: 'Other' },
];

export default function CertificateDoc({ participantId }: { participantId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';

  const [docs,    setDocs]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [form, setForm] = useState({
    certType: 'completion', title: '', issuedDate: '', issuedBy: '', validUntil: '', notes: '',
  });

  const load = async () => {
    try {
      const all = await api<any[]>('/documents').catch(() => []);
      setDocs((Array.isArray(all) ? all : []).filter(
        (d) => d.type === 'CERTIFICATE' && d.participantId === participantId
      ));
    } catch { setDocs([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [participantId]);

  const openNew = () => {
    setEditId(null);
    setForm({ certType: 'completion', title: '', issuedDate: new Date().toLocaleDateString('de-DE'), issuedBy: '', validUntil: '', notes: '' });
    setOpen(true);
  };

  const openEdit = (d: any) => {
    let extra: any = {};
    try { extra = d.responsible ? JSON.parse(d.responsible) : {}; } catch {}
    setEditId(d.id);
    setForm({
      certType:   extra.certType   ?? 'completion',
      title:      extra.title      ?? '',
      issuedDate: extra.issuedDate ?? '',
      issuedBy:   extra.issuedBy   ?? '',
      validUntil: extra.validUntil ?? '',
      notes:      extra.notes      ?? '',
    });
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        type:          'CERTIFICATE',
        participantId,
        status:        'doc_ready',
        responsible:   JSON.stringify({
          certType:   form.certType,
          title:      form.title,
          issuedDate: form.issuedDate,
          issuedBy:   form.issuedBy,
          validUntil: form.validUntil,
          notes:      form.notes,
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
      console.error('Certificate save failed', e);
      alert(de ? 'Fehler beim Speichern.' : 'Save failed.');
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Zertifikat löschen?' : 'Delete certificate?')) return;
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
      const res = await fetch(`${API}/documents/${id}/upload`, {
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
          <Award size={15} color={C.iris} />
          {de ? 'Zertifikate (#8)' : 'Certificates (#8)'} · {docs.length}
        </div>
        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={openNew}>
          <Plus size={13} /> {de ? 'Zertifikat hinzufügen' : 'Add certificate'}
        </button>
      </div>

      {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}

      {!loading && docs.length === 0 && (
        <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>
          {de ? 'Keine Zertifikate vorhanden.' : 'No certificates on file.'}
        </div>
      )}

      {!loading && docs.map((d, i) => {
        let extra: any = {};
        try { extra = d.responsible ? JSON.parse(d.responsible) : {}; } catch {}
        const certLabel = CERT_TYPES.find((c) => c.value === extra.certType);
        return (
          <div key={d.id ?? i} style={{ padding: '12px 0', borderTop: i > 0 ? `1px solid ${C.lineSoft}` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: C.mint + '18', display: 'grid', placeItems: 'center' }}>
                <Award size={17} color={C.mint} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {extra.title || (certLabel ? (de ? certLabel.de : certLabel.en) : (de ? 'Zertifikat' : 'Certificate'))}
                </div>
                <div style={{ fontSize: 11.5, color: C.muted }}>
                  {certLabel ? (de ? certLabel.de : certLabel.en) : '—'}
                  {extra.issuedDate && ` · ${extra.issuedDate}`}
                </div>
              </div>
              <span className="badge" style={{ background: C.mint + '18', color: C.mint, fontSize: 11 }}>
                {de ? 'Ausgestellt ✅' : 'Issued ✅'}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {extra.issuedBy && (
                <span style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 20, background: C.iris + '10', color: C.iris }}>
                  {de ? 'Von:' : 'By:'} {extra.issuedBy}
                </span>
              )}
              {extra.validUntil && (
                <span style={{ fontSize: 11.5, padding: '3px 9px', borderRadius: 20, background: C.amber + '10', color: C.amber }}>
                  {de ? 'Gültig bis:' : 'Valid until:'} {extra.validUntil}
                </span>
              )}
            </div>

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
                    onClick={() => fileRefs.current[d.id]?.click()}>
                    <Upload size={12} /> {uploading === d.id ? '…' : (de ? 'PDF hochladen' : 'Upload PDF')}
                  </button>
                  <input ref={(el) => { fileRefs.current[d.id] = el; }} type="file" accept=".pdf,.png,.jpg"
                    style={{ display: 'none' }}
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
                {editId ? (de ? 'Zertifikat bearbeiten' : 'Edit certificate') : (de ? 'Zertifikat hinzufügen' : 'Add certificate')}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Typ' : 'Type'}
                <select value={form.certType} onChange={(e) => set('certType', e.target.value)} style={inp}>
                  {CERT_TYPES.map((o) => <option key={o.value} value={o.value}>{de ? o.de : o.en}</option>)}
                </select>
              </label>
              <label style={lbl}>{de ? 'Titel / Bezeichnung' : 'Title'}
                <input value={form.title} onChange={(e) => set('title', e.target.value)}
                  style={inp} placeholder={de ? 'z.B. Abschlusszertifikat Data Analytics' : 'e.g. Data Analytics Certificate'} />
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Ausgestellt am' : 'Issued on'}
                  <input value={form.issuedDate} onChange={(e) => set('issuedDate', e.target.value)} style={inp} placeholder="TT.MM.JJJJ" />
                </label>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Gültig bis' : 'Valid until'}
                  <input value={form.validUntil} onChange={(e) => set('validUntil', e.target.value)} style={inp} placeholder="TT.MM.JJJJ" />
                </label>
              </div>
              <label style={lbl}>{de ? 'Ausgestellt von' : 'Issued by'}
                <input value={form.issuedBy} onChange={(e) => set('issuedBy', e.target.value)}
                  style={inp} placeholder={de ? 'z.B. OpenMindsAI GmbH' : 'e.g. OpenMindsAI GmbH'} />
              </label>
              <label style={lbl}>{de ? 'Notizen' : 'Notes'}
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
                  style={{ ...inp, minHeight: 60, resize: 'vertical' }} />
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
import React, { useState, useEffect, useRef } from 'react';
import { Camera, Plus, X, Pencil, Trash2, Upload, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

const MEDIA_TYPES = [
  { value: 'photo',    de: 'Fotos',                    en: 'Photos' },
  { value: 'video',    de: 'Videos / Aufzeichnungen',  en: 'Video / recordings' },
  { value: 'stream',   de: 'Live-Streaming',           en: 'Live streaming' },
  { value: 'social',   de: 'Social Media',             en: 'Social media' },
  { value: 'all',      de: 'Alle Medienrechte',        en: 'All media rights' },
];

export default function MediaConsent({ participantId }: { participantId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';

  const [docs, setDocs]           = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);
  const [saving, setSaving]       = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const [form, setForm] = useState({
    mediaTypes: [] as string[],
    signedDate: '',
    version: '1.0',
    responsible: '',
    purpose: '',
    status: 'doc_missing',
  });

  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = async () => {
    try {
      const d = await api<any[]>(`/documents/participant/${participantId}`);
      setDocs((Array.isArray(d) ? d : []).filter((x) => x.type === 'MEDIA_CONSENT'));
    } catch { setDocs([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [participantId]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const toggleMedia = (val: string) => {
    setForm((f) => ({
      ...f,
      mediaTypes: f.mediaTypes.includes(val)
        ? f.mediaTypes.filter((x) => x !== val)
        : [...f.mediaTypes, val],
    }));
  };

  const openNew = () => {
    setEditId(null);
    setForm({ mediaTypes: [], signedDate: '', version: '1.0', responsible: '', purpose: '', status: 'doc_missing' });
    setOpen(true);
  };

  const openEdit = (d: any) => {
    setEditId(d.id);
    let extra: any = {};
    try { extra = d.responsible ? JSON.parse(d.responsible) : {}; } catch { extra = { name: d.responsible }; }
    setForm({
      mediaTypes:  extra.mediaTypes  ?? [],
      signedDate:  extra.signedDate  ?? '',
      version:     extra.version     ?? '1.0',
      responsible: extra.name        ?? '',
      purpose:     extra.purpose     ?? '',
      status:      d.status          ?? 'doc_missing',
    });
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const responsibleData = JSON.stringify({
        name:       form.responsible,
        signedDate: form.signedDate,
        version:    form.version,
        mediaTypes: form.mediaTypes,
        purpose:    form.purpose,
      });
      const payload = {
        type:          'MEDIA_CONSENT',
        participantId,
        responsible:   responsibleData,
        status:        form.status,
      };
      if (editId) {
        await api(`/documents/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/documents', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpen(false);
      await load();
    } catch (e) { console.error('media consent save failed', e); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Einwilligung löschen?' : 'Delete consent?')) return;
    try { await api(`/documents/${id}`, { method: 'DELETE' }); await load(); }
    catch (e) { console.error(e); }
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
    } catch (e) {
      console.error('upload failed', e);
      alert(de ? 'Upload fehlgeschlagen.' : 'Upload failed.');
    } finally { setUploading(null); }
  };

  const downloadFile = async (id: string) => {
    try {
      const data = await api<{ url: string }>(`/documents/${id}/file-url`);
      if (data?.url) window.open(data.url, '_blank');
      else alert(de ? 'Keine Datei vorhanden.' : 'No file available.');
    } catch (e) { console.error(e); }
  };

  const parseExtra = (d: any) => {
    try { return d.responsible ? JSON.parse(d.responsible) : {}; }
    catch { return { name: d.responsible }; }
  };

  const mediaLabel = (v: string) => MEDIA_TYPES.find((m) => m.value === v)?.[lang as 'de' | 'en'] ?? v;

  return (
    <div className="card" style={{ marginTop: 15 }}>
      <div className="card-head">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Camera size={15} color={C.iris} />
          {de ? 'Einwilligung Medienrechte (#4)' : 'Media rights consent (#4)'} · {docs.length}
        </div>
        <button className="btn btn-primary" style={{ padding: '7px 13px', fontSize: 12 }} onClick={openNew}>
          <Plus size={13} /> {de ? 'Neu' : 'New'}
        </button>
      </div>

      {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}

      {!loading && docs.length === 0 && (
        <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>
          {de ? 'Noch keine Medienrechte-Einwilligung erfasst.' : 'No media consent recorded yet.'}
        </div>
      )}

      {!loading && docs.map((d, i) => {
        const extra  = parseExtra(d);
        const signed = d.status === 'doc_ready';
        return (
          <div key={d.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0',
            borderBottom: i < docs.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: signed ? C.mint + '18' : C.rose + '18',
              display: 'grid', placeItems: 'center',
            }}>
              <Camera size={18} color={signed ? C.mint : C.rose} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {de ? 'Medienrechte-Einwilligung' : 'Media Rights Consent'}
                {extra.version && <span style={{ fontWeight: 400, fontSize: 11, color: C.muted }}>v{extra.version}</span>}
                {signed
                  ? <span className="badge" style={{ background: C.mint + '18', color: C.mint, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <CheckCircle2 size={11} /> {de ? 'Unterzeichnet' : 'Signed'}
                    </span>
                  : <span className="badge" style={{ background: C.rose + '18', color: C.rose, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <AlertTriangle size={11} /> {de ? 'Ausstehend' : 'Pending'}
                    </span>}
              </div>

              {/* Media types tags */}
              {extra.mediaTypes?.length > 0 && (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 5 }}>
                  {extra.mediaTypes.map((mt: string) => (
                    <span key={mt} style={{
                      fontSize: 10.5, padding: '2px 8px', borderRadius: 20,
                      background: C.iris + '12', color: C.iris, fontWeight: 600,
                    }}>
                      {mediaLabel(mt)}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {extra.signedDate  && <span>{de ? 'Datum:' : 'Date:'} {extra.signedDate}</span>}
                {extra.name        && <span>{de ? 'Zuständig:' : 'By:'} {extra.name}</span>}
                {extra.purpose     && <span>{de ? 'Zweck:' : 'Purpose:'} {extra.purpose}</span>}
              </div>

              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                {d.fileRef ? (
                  <button className="btn btn-ghost" style={{ padding: '4px 9px', fontSize: 11 }}
                    onClick={() => downloadFile(d.id)}>
                    <Download size={12} /> {de ? 'Öffnen' : 'Open'}
                  </button>
                ) : (
                  <button className="btn btn-ghost" style={{ padding: '4px 9px', fontSize: 11 }}
                    disabled={uploading === d.id}
                    onClick={() => fileRefs.current[d.id]?.click()}>
                    <Upload size={12} /> {uploading === d.id ? '…' : (de ? 'Datei hochladen' : 'Upload file')}
                  </button>
                )}
                <input
                  ref={(el) => { fileRefs.current[d.id] = el; }}
                  type="file" accept=".pdf,.doc,.docx,.png,.jpg"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadFile(d.id, f);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              <button className="icon-mini" onClick={() => openEdit(d)}><Pencil size={13} color={C.muted} /></button>
              <button className="icon-mini" onClick={() => remove(d.id)}><Trash2 size={13} color={C.muted} /></button>
            </div>
          </div>
        );
      })}

      {/* ===== MODAL ===== */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 480, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editId
                  ? (de ? 'Medienrechte bearbeiten' : 'Edit media consent')
                  : (de ? 'Neue Medienrechte-Einwilligung' : 'New media consent')}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>

              {/* Media types checkboxes */}
              <div>
                <div style={{ fontSize: 12.5, color: '#334155', marginBottom: 8, fontWeight: 600 }}>
                  {de ? 'Einwilligung für *' : 'Consent for *'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {MEDIA_TYPES.map((mt) => (
                    <label key={mt.value} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.mediaTypes.includes(mt.value)}
                        onChange={() => toggleMedia(mt.value)}
                      />
                      {mt[lang as 'de' | 'en']}
                    </label>
                  ))}
                </div>
              </div>

              <label style={lbl}>{de ? 'Zweck / Verwendung' : 'Purpose / usage'}
                <input value={form.purpose} onChange={(e) => set('purpose', e.target.value)} style={inp}
                  placeholder={de ? 'z.B. Werbematerial, Social Media, interne Nutzung…' : 'e.g. Marketing, social media, internal use…'} />
              </label>

              <label style={lbl}>{de ? 'Version' : 'Version'}
                <input value={form.version} onChange={(e) => set('version', e.target.value)}
                  style={inp} placeholder="1.0" />
              </label>

              <label style={lbl}>{de ? 'Unterzeichnet am' : 'Signed on'}
                <input value={form.signedDate} onChange={(e) => set('signedDate', e.target.value)}
                  style={inp} placeholder="01.01.2025" />
              </label>

              <label style={lbl}>{de ? 'Zuständig' : 'Responsible'}
                <input value={form.responsible} onChange={(e) => set('responsible', e.target.value)}
                  style={inp} placeholder={de ? 'z.B. Verwaltung…' : 'e.g. Admin…'} />
              </label>

              <label style={lbl}>{de ? 'Status' : 'Status'}
                <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inp}>
                  <option value="doc_missing">{de ? 'Ausstehend (nicht unterschrieben)' : 'Pending (not signed)'}</option>
                  <option value="doc_partial">{de ? 'Teilweise ausgefüllt' : 'Partially completed'}</option>
                  <option value="doc_ready">{de ? 'Vollständig & unterzeichnet' : 'Complete & signed'}</option>
                </select>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.status === 'doc_ready'}
                  onChange={(e) => set('status', e.target.checked ? 'doc_ready' : 'doc_missing')}
                />
                {de ? 'Vom Teilnehmer unterzeichnet ✅' : 'Signed by participant ✅'}
              </label>

              {form.status === 'doc_ready' && (
                <div style={{ padding: '10px 14px', borderRadius: 9, background: C.mint + '10', border: `1px solid ${C.mint}`, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} color={C.mint} />
                  <span style={{ color: C.mint, fontWeight: 600 }}>
                    {de ? 'Medienrechte unterzeichnet' : 'Media consent signed'}
                    {form.signedDate ? ` — ${form.signedDate}` : ''}
                  </span>
                </div>
              )}

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

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16,
};
const lbl: React.CSSProperties = { fontSize: 12.5, color: '#334155', display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = {
  width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9,
  border: '1px solid #E2E8F0', fontSize: 13, outline: 'none',
};
import React, { useState, useEffect, useRef } from 'react';
import { Shield, Plus, X, Pencil, Trash2, Upload, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

const SCOPES = [
  { value: 'full',    de: 'Vollständig (Name, Kontakt, Bild, Daten)', en: 'Full (name, contact, image, data)' },
  { value: 'basic',   de: 'Grundlegend (Name, Kontakt)',               en: 'Basic (name, contact)' },
  { value: 'minimal', de: 'Minimal (nur Pflichtfelder)',               en: 'Minimal (required fields only)' },
];

export default function PrivacyConsent({ participantId }: { participantId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';

  const [docs, setDocs]           = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);
  const [saving, setSaving]       = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [form, setForm]           = useState({
    signedDate: '',
    version: '1.0',
    scope: 'full',
    responsible: '',
    status: 'doc_missing',
  });

  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = async () => {
    try {
      const d = await api<any[]>(`/documents/participant/${participantId}`);
      const privacy = (Array.isArray(d) ? d : []).filter((x) => x.type === 'PRIVACY_CONSENT');
      setDocs(privacy);
    } catch { setDocs([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [participantId]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditId(null);
    setForm({ signedDate: '', version: '1.0', scope: 'full', responsible: '', status: 'doc_missing' });
    setOpen(true);
  };

  const openEdit = (d: any) => {
    setEditId(d.id);
    let extra: any = {};
    try { extra = d.responsible ? JSON.parse(d.responsible) : {}; } catch { extra = { name: d.responsible }; }
    setForm({
      signedDate:  extra.signedDate  ?? '',
      version:     extra.version     ?? '1.0',
      scope:       extra.scope       ?? 'full',
      responsible: extra.name        ?? '',
      status:      d.status          ?? 'doc_missing',
    });
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const responsibleData = JSON.stringify({
        name:        form.responsible,
        signedDate:  form.signedDate,
        version:     form.version,
        scope:       form.scope,
      });
      const payload = {
        type:          'PRIVACY_CONSENT',
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
    } catch (e) { console.error('privacy consent save failed', e); }
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
      const res = await fetch(`${API}/documents/${id}/upload`, {
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

  const scopeLabel = (v: string) => SCOPES.find((s) => s.value === v)?.[lang as 'de' | 'en'] ?? v;

  return (
    <div className="card" style={{ marginTop: 15 }}>
      <div className="card-head">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={15} color={C.iris} />
          {de ? 'Datenschutzerklärung (#3)' : 'Privacy statement (#3)'} · {docs.length}
        </div>
        <button className="btn btn-primary" style={{ padding: '7px 13px', fontSize: 12 }} onClick={openNew}>
          <Plus size={13} /> {de ? 'Neu' : 'New'}
        </button>
      </div>

      {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}

      {!loading && docs.length === 0 && (
        <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>
          {de ? 'Noch keine Datenschutzerklärung erfasst.' : 'No privacy statement recorded yet.'}
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
              <Shield size={18} color={signed ? C.mint : C.rose} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {de ? 'Datenschutzerklärung' : 'Privacy Statement'}
                {extra.version && (
                  <span style={{ fontWeight: 400, fontSize: 11, color: C.muted }}>v{extra.version}</span>
                )}
                {signed
                  ? <span className="badge" style={{ background: C.mint + '18', color: C.mint, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <CheckCircle2 size={11} /> {de ? 'Unterzeichnet' : 'Signed'}
                    </span>
                  : <span className="badge" style={{ background: C.rose + '18', color: C.rose, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <AlertTriangle size={11} /> {de ? 'Ausstehend' : 'Pending'}
                    </span>}
              </div>

              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {extra.signedDate && <span>{de ? 'Datum:' : 'Date:'} {extra.signedDate}</span>}
                {extra.scope     && <span>{de ? 'Umfang:' : 'Scope:'} {scopeLabel(extra.scope)}</span>}
                {extra.name      && <span>{de ? 'Zuständig:' : 'By:'} {extra.name}</span>}
              </div>

              <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                {d.fileRef ? (
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '4px 9px', fontSize: 11 }}
                    onClick={() => downloadFile(d.id)}
                  >
                    <Download size={12} /> {de ? 'Öffnen' : 'Open'}
                  </button>
                ) : (
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '4px 9px', fontSize: 11 }}
                    disabled={uploading === d.id}
                    onClick={() => fileRefs.current[d.id]?.click()}
                  >
                    <Upload size={12} /> {uploading === d.id ? '…' : (de ? 'Datei hochladen' : 'Upload file')}
                  </button>
                )}
                <input
                  ref={(el) => { fileRefs.current[d.id] = el; }}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg"
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
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ width: '100%', maxWidth: 460, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editId
                  ? (de ? 'Datenschutz bearbeiten' : 'Edit privacy statement')
                  : (de ? 'Neue Datenschutzerklärung' : 'New privacy statement')}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              <label style={lbl}>{de ? 'Version der Datenschutzerklärung' : 'Privacy policy version'}
                <input
                  value={form.version}
                  onChange={(e) => set('version', e.target.value)}
                  style={inp}
                  placeholder="1.0 / 2.0 / 2024-01…"
                />
              </label>

              <label style={lbl}>{de ? 'Umfang der Einwilligung' : 'Consent scope'}
                <select value={form.scope} onChange={(e) => set('scope', e.target.value)} style={inp}>
                  {SCOPES.map((s) => (
                    <option key={s.value} value={s.value}>{s[lang as 'de' | 'en']}</option>
                  ))}
                </select>
              </label>

              <label style={lbl}>{de ? 'Unterzeichnet am' : 'Signed on'}
                <input
                  value={form.signedDate}
                  onChange={(e) => set('signedDate', e.target.value)}
                  style={inp}
                  placeholder="01.01.2025"
                />
              </label>

              <label style={lbl}>{de ? 'Zuständig / Aufgenommen von' : 'Responsible / Collected by'}
                <input
                  value={form.responsible}
                  onChange={(e) => set('responsible', e.target.value)}
                  style={inp}
                  placeholder={de ? 'z.B. Verwaltung, Hr. Müller…' : 'e.g. Admin, Ms. Smith…'}
                />
              </label>

              <label style={lbl}>{de ? 'Status' : 'Status'}
                <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inp}>
                  <option value="doc_missing">{de ? 'Ausstehend (nicht unterschrieben)' : 'Pending (not signed)'}</option>
                  <option value="doc_partial">{de ? 'Teilweise ausgefüllt' : 'Partially completed'}</option>
                  <option value="doc_ready">{de ? 'Vollständig & unterzeichnet' : 'Complete & signed'}</option>
                </select>
              </label>

              {/* Signed checkbox — يغيّر status مباشرةً */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, cursor: 'pointer', padding: '4px 0' }}>
                <input
                  type="checkbox"
                  checked={form.status === 'doc_ready'}
                  onChange={(e) => set('status', e.target.checked ? 'doc_ready' : 'doc_missing')}
                />
                {de ? 'Vom Teilnehmer unterzeichnet ✅' : 'Signed by participant ✅'}
              </label>

              {form.status === 'doc_ready' && (
                <div style={{
                  padding: '10px 14px', borderRadius: 9,
                  background: C.mint + '10', border: `1px solid ${C.mint}`,
                  fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <CheckCircle2 size={13} color={C.mint} />
                  <span style={{ color: C.mint, fontWeight: 600 }}>
                    {de ? 'Datenschutzerklärung unterzeichnet' : 'Privacy statement signed'}
                    {form.signedDate ? ` — ${form.signedDate}` : ''}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  className="btn"
                  style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving}
                  onClick={() => setOpen(false)}
                >
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button
                  className="btn btn-primary"
                  style={{ padding: '9px 16px' }}
                  disabled={saving}
                  onClick={submit}
                >
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
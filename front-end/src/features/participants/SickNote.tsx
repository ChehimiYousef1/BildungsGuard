import React, { useState, useEffect, useRef } from 'react';
import { Stethoscope, Plus, X, Pencil, Trash2, Upload, Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

export default function SickNote({ participantId }: { participantId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';

  const [docs, setDocs]           = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);
  const [saving, setSaving]       = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const [form, setForm] = useState({
    dateFrom:    '',
    dateTo:      '',
    days:        '',
    doctor:      '',
    institution: '',
    notes:       '',
    status:      'doc_missing',
  });

  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = async () => {
    try {
      const d = await api<any[]>(`/documents/participant/${participantId}`);
      setDocs((Array.isArray(d) ? d : []).filter((x) => x.type === 'SICK_NOTE'));
    } catch { setDocs([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [participantId]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditId(null);
    setForm({ dateFrom: '', dateTo: '', days: '', doctor: '', institution: '', notes: '', status: 'doc_missing' });
    setOpen(true);
  };

  const openEdit = (d: any) => {
    setEditId(d.id);
    let extra: any = {};
    try { extra = d.responsible ? JSON.parse(d.responsible) : {}; } catch { extra = { doctor: d.responsible }; }
    setForm({
      dateFrom:    extra.dateFrom    ?? '',
      dateTo:      extra.dateTo      ?? '',
      days:        extra.days        ?? '',
      doctor:      extra.doctor      ?? '',
      institution: extra.institution ?? '',
      notes:       extra.notes       ?? '',
      status:      d.status          ?? 'doc_missing',
    });
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const responsible = JSON.stringify({
        dateFrom:    form.dateFrom,
        dateTo:      form.dateTo,
        days:        form.days,
        doctor:      form.doctor,
        institution: form.institution,
        notes:       form.notes,
      });
      const payload = { type: 'SICK_NOTE', participantId, responsible, status: form.status };
      if (editId) {
        await api(`/documents/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/documents', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpen(false);
      await load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Krankmeldung löschen?' : 'Delete sick note?')) return;
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
      alert(de ? 'Upload fehlgeschlagen.' : 'Upload failed.');
    } finally { setUploading(null); }
  };

  const downloadFile = async (id: string) => {
    try {
      const data = await api<{ url: string }>(`/documents/${id}/file-url`);
      if (data?.url) window.open(data.url, '_blank');
    } catch (e) { console.error(e); }
  };

  const parseExtra = (d: any) => {
    try { return d.responsible ? JSON.parse(d.responsible) : {}; }
    catch { return { doctor: d.responsible }; }
  };

  const calcDays = (from: string, to: string) => {
    try {
      const [d1, m1, y1] = from.split('.').map(Number);
      const [d2, m2, y2] = to.split('.').map(Number);
      const diff = Math.ceil((new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()) / 86400000) + 1;
      return diff > 0 ? diff : null;
    } catch { return null; }
  };

  return (
    <div className="card" style={{ marginTop: 15 }}>
      <div className="card-head">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Stethoscope size={15} color={C.iris} />
          {de ? 'Krankmeldungen (#6)' : 'Sick-leave certificates (#6)'} · {docs.length}
        </div>
        <button className="btn btn-primary" style={{ padding: '7px 13px', fontSize: 12 }} onClick={openNew}>
          <Plus size={13} /> {de ? 'Neu' : 'New'}
        </button>
      </div>

      {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}
      {!loading && docs.length === 0 && (
        <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>
          {de ? 'Keine Krankmeldungen.' : 'No sick notes yet.'}
        </div>
      )}

      {!loading && docs.map((d, i) => {
        const extra  = parseExtra(d);
        const filed  = d.status === 'doc_ready';
        const days   = extra.dateFrom && extra.dateTo ? calcDays(extra.dateFrom, extra.dateTo) : extra.days ? Number(extra.days) : null;
        return (
          <div key={d.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0',
            borderBottom: i < docs.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: filed ? C.mint + '18' : C.rose + '18',
              display: 'grid', placeItems: 'center',
            }}>
              <Stethoscope size={18} color={filed ? C.mint : C.rose} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {extra.dateFrom && extra.dateTo
                  ? `${extra.dateFrom} → ${extra.dateTo}`
                  : (de ? 'Krankmeldung' : 'Sick note')}
                {days && (
                  <span className="badge" style={{ background: C.rose + '12', color: C.rose, fontSize: 11 }}>
                    {days} {de ? 'Tage' : 'days'}
                  </span>
                )}
                {filed
                  ? <span className="badge" style={{ background: C.mint + '18', color: C.mint, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <CheckCircle2 size={11} /> {de ? 'Eingereicht' : 'Filed'}
                    </span>
                  : <span className="badge" style={{ background: C.rose + '18', color: C.rose, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <AlertTriangle size={11} /> {de ? 'Ausstehend' : 'Pending'}
                    </span>}
              </div>

              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {extra.doctor      && <span>{de ? 'Arzt:' : 'Doctor:'} {extra.doctor}</span>}
                {extra.institution && <span>{de ? 'Einrichtung:' : 'Institution:'} {extra.institution}</span>}
                {extra.notes       && <span style={{ fontStyle: 'italic' }}>{extra.notes}</span>}
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
                    <Upload size={12} /> {uploading === d.id ? '…' : (de ? 'Attest hochladen' : 'Upload certificate')}
                  </button>
                )}
                <input
                  ref={(el) => { fileRefs.current[d.id] = el; }}
                  type="file" accept=".pdf,.jpg,.png"
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

      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 460, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editId ? (de ? 'Krankmeldung bearbeiten' : 'Edit sick note') : (de ? 'Neue Krankmeldung' : 'New sick note')}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Krank von' : 'Sick from'}
                  <input value={form.dateFrom} onChange={(e) => set('dateFrom', e.target.value)}
                    style={inp} placeholder="01.01.2025" />
                </label>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Krank bis' : 'Sick until'}
                  <input value={form.dateTo} onChange={(e) => set('dateTo', e.target.value)}
                    style={inp} placeholder="03.01.2025" />
                </label>
              </div>

              {form.dateFrom && form.dateTo && (() => {
                const d = calcDays(form.dateFrom, form.dateTo);
                return d ? (
                  <div style={{ fontSize: 12.5, color: C.rose, fontWeight: 600 }}>
                    → {d} {de ? 'Krankheitstage' : 'sick days'}
                  </div>
                ) : null;
              })()}

              <label style={lbl}>{de ? 'Arzt / Ärztin' : 'Doctor'}
                <input value={form.doctor} onChange={(e) => set('doctor', e.target.value)}
                  style={inp} placeholder={de ? 'Dr. Müller' : 'Dr. Smith'} />
              </label>

              <label style={lbl}>{de ? 'Einrichtung / Klinik' : 'Institution / Clinic'}
                <input value={form.institution} onChange={(e) => set('institution', e.target.value)}
                  style={inp} placeholder={de ? 'Arztpraxis Hamburg…' : 'Medical clinic…'} />
              </label>

              <label style={lbl}>{de ? 'Notizen' : 'Notes'}
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
                  style={{ ...inp, minHeight: 55, resize: 'vertical' }} />
              </label>

              <label style={lbl}>{de ? 'Status' : 'Status'}
                <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inp}>
                  <option value="doc_missing">{de ? 'Ausstehend' : 'Pending'}</option>
                  <option value="doc_partial">{de ? 'Teilweise' : 'Partial'}</option>
                  <option value="doc_ready">{de ? 'Eingereicht' : 'Filed'}</option>
                </select>
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

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16,
};
const lbl: React.CSSProperties = { fontSize: 12.5, color: '#334155', display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = {
  width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9,
  border: '1px solid #E2E8F0', fontSize: 13, outline: 'none',
};
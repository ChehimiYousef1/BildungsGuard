import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, FileText, Check } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

// الأنواع الـ 8 (وثائق AZAV #10-16, 18)
const TYPES: { id: string; de: string; en: string }[] = [
  { id: 'APTITUDE', de: 'Eignungsfeststellung', en: 'Aptitude assessment' },
  { id: 'COUNSELING', de: 'Beratungsprotokoll', en: 'Counseling record' },
  { id: 'INTAKE_FORM', de: 'Teilnehmerbogen', en: 'Participant form' },
  { id: 'MEETING_MINUTES', de: 'Gesprächsprotokoll', en: 'Meeting minutes' },
  { id: 'LEARNING_GOALS', de: 'Lernzielvereinbarung', en: 'Learning objectives' },
  { id: 'SUPPORT_PROOF', de: 'Nachweis individuelle Förderung', en: 'Proof of support' },
  { id: 'COACHING_PROGRESS', de: 'Fortschrittsdokumentation (Coaching)', en: 'Coaching progress' },
  { id: 'RESULTS', de: 'Ergebnisbogen', en: 'Results sheet' },
];

export default function ParticipantRecords({ participantId }: { participantId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ type: 'APTITUDE', title: '', content: '', recordDate: '', author: '', signed: false });

  const typeLabel = (id: string) => { const t = TYPES.find((x) => x.id === id); return t ? (de ? t.de : t.en) : id; };

  const load = async () => {
    if (!participantId) { setLoading(false); return; }
    try {
      const data = await api<any[]>(`/participant-records?participantId=${participantId}`);
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [participantId]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditId(null); setForm({ type: 'APTITUDE', title: '', content: '', recordDate: new Date().toLocaleDateString('de-DE'), author: '', signed: false }); setOpen(true); };
  const openEdit = (r: any) => { setEditId(r.id); setForm({ type: r.type ?? 'APTITUDE', title: r.title ?? '', content: r.content ?? '', recordDate: r.recordDate ?? '', author: r.author ?? '', signed: !!r.signed }); setOpen(true); };

  const submit = async () => {
    setSaving(true);
    const payload: any = {
      type: form.type,
      title: form.title.trim() || undefined,
      content: form.content.trim() || undefined,
      recordDate: form.recordDate.trim() || undefined,
      author: form.author.trim() || undefined,
      signed: !!form.signed,
    };
    try {
      if (editId) {
        await api(`/participant-records/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/participant-records', { method: 'POST', body: JSON.stringify({ ...payload, participantId }) });
      }
      setOpen(false);
      setLoading(true);
      await load();
    } catch (e) { console.error('save record failed', e); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Diesen Eintrag löschen?' : 'Delete this record?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/participant-records/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      setLoading(true);
      await load();
    } catch (e) { console.error('delete record failed', e); }
  };

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">{de ? 'Coaching & Akte-Einträge' : 'Coaching & file records'} · {rows.length}</div>
        <button className="btn btn-primary" style={{ padding: '7px 13px' }} onClick={openCreate}><Plus size={14} /> {de ? 'Eintrag' : 'Record'}</button>
      </div>

      {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}
      {!loading && rows.length === 0 && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>{de ? 'Noch keine Einträge.' : 'No records yet.'}</div>}

      {!loading && rows.map((r) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 4px', borderBottom: `1px solid ${C.lineSoft}` }}>
          <FileText size={15} color={C.iris} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: 12.5 }}>{typeLabel(r.type)}</span>
              {r.signed && <span className="badge" style={{ background: C.mint + '22', color: C.mint }}>{de ? 'unterschrieben' : 'signed'}</span>}
              {r.recordDate && <span className="mono" style={{ fontSize: 11, color: C.muted }}>{r.recordDate}</span>}
            </div>
            {r.title && <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>{r.title}</div>}
            {r.content && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{r.content}</div>}
            {r.author && <div style={{ fontSize: 10.5, color: C.mutedLight, marginTop: 2 }}>— {r.author}</div>}
          </div>
          <button onClick={() => openEdit(r)} style={iconBtn}><Pencil size={13} color={C.muted} /></button>
          <button onClick={() => remove(r.id)} style={iconBtn}><Trash2 size={13} color={C.muted} /></button>
        </div>
      ))}

      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 500, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>{editId ? (de ? 'Eintrag bearbeiten' : 'Edit record') : (de ? 'Neuer Eintrag' : 'New record')}</div>
              <button onClick={() => !saving && setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Typ' : 'Type'}
                <select value={form.type} onChange={(e) => set('type', e.target.value)} style={inp}>
                  {TYPES.map((tp) => <option key={tp.id} value={tp.id}>{de ? tp.de : tp.en}</option>)}
                </select>
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Datum' : 'Date'}<input value={form.recordDate} onChange={(e) => set('recordDate', e.target.value)} style={inp} placeholder="TT.MM.JJJJ" /></label>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Verfasser' : 'Author'}<input value={form.author} onChange={(e) => set('author', e.target.value)} style={inp} placeholder={de ? 'Coach/Dozent' : 'Coach/Trainer'} /></label>
              </div>
              <label style={lbl}>{de ? 'Titel' : 'Title'}<input value={form.title} onChange={(e) => set('title', e.target.value)} style={inp} /></label>
              <label style={lbl}>{de ? 'Inhalt / Notizen' : 'Content / notes'}<textarea value={form.content} onChange={(e) => set('content', e.target.value)} style={{ ...inp, minHeight: 100, resize: 'vertical' }} /></label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: C.inkSoft, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.signed} onChange={(e) => set('signed', e.target.checked)} />
                {de ? 'Unterschrieben (z.B. Lernzielvereinbarung)' : 'Signed (e.g. learning goals)'}
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }} disabled={saving} onClick={() => setOpen(false)}>{de ? 'Abbrechen' : 'Cancel'}</button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }} disabled={saving} onClick={submit}>{saving ? '…' : (de ? 'Speichern' : 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 };
const lbl: React.CSSProperties = { fontSize: 12.5, color: C.inkSoft, display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = { width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13, outline: 'none' };
const iconBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'grid', placeItems: 'center' };
import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, BookOpen, Clock } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';
import { DateField } from '../../components/DateField';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

export default function CourseRecords({ courseId }: { courseId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ recordDate: '', topic: '', trainer: '', hours: '', notes: '' });

  const load = async () => {
    if (!courseId) { setLoading(false); return; }
    try {
      const data = await api<any[]>(`/course-records?courseId=${courseId}`);
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [courseId]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditId(null); setForm({ recordDate: '', topic: '', trainer: '', hours: '', notes: '' }); setOpen(true); };
  const openEdit = (r: any) => { setEditId(r.id); setForm({ recordDate: r.recordDate ?? '', topic: r.topic ?? '', trainer: r.trainer ?? '', hours: r.hours ?? '', notes: r.notes ?? '' }); setOpen(true); };

  const submit = async () => {
    setSaving(true);
    const payload: any = {
      type: 'TEACHING_LOG',
      recordDate: form.recordDate.trim() || undefined,
      topic: form.topic.trim() || undefined,
      trainer: form.trainer.trim() || undefined,
      hours: form.hours ? Number(form.hours) : undefined,
      notes: form.notes.trim() || undefined,
    };
    try {
      if (editId) {
        await api(`/course-records/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/course-records', { method: 'POST', body: JSON.stringify({ ...payload, courseId }) });
      }
      setOpen(false);
      setLoading(true);
      await load();
    } catch (e) { console.error('save course record failed', e); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Diesen Eintrag löschen?' : 'Delete this entry?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/course-records/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      setLoading(true);
      await load();
    } catch (e) { console.error('delete course record failed', e); }
  };

  const totalHours = rows.reduce((s, r) => s + (Number(r.hours) || 0), 0);

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${C.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: C.inkSoft }}>
          <BookOpen size={13} color={C.iris} /> {de ? 'Unterrichtsdokumentation' : 'Teaching log'} · {rows.length}
          {totalHours > 0 && <span className="badge" style={{ background: C.iris + '18', color: C.iris }}>{totalHours} UE</span>}
        </div>
        <button className="btn btn-ghost" style={{ padding: '4px 9px', fontSize: 11 }} onClick={openCreate}><Plus size={12} /> {de ? 'Eintrag' : 'Entry'}</button>
      </div>

      {loading && <div style={{ fontSize: 11.5, color: C.mutedLight, padding: '4px 0' }}>…</div>}
      {!loading && rows.length === 0 && <div style={{ fontSize: 11.5, color: C.mutedLight, padding: '4px 0' }}>{de ? 'Keine Einträge.' : 'No entries.'}</div>}

      {!loading && rows.map((r) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
          <Clock size={12} color={C.muted} style={{ flexShrink: 0, marginTop: 3 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              {r.recordDate && <span className="mono" style={{ fontSize: 11, color: C.muted }}>{r.recordDate}</span>}
              <span style={{ fontSize: 12, fontWeight: 600 }}>{r.topic || '—'}</span>
              {r.hours ? <span className="badge" style={{ background: C.soft, color: C.inkSoft }}>{r.hours} UE</span> : null}
            </div>
            {r.trainer && <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{de ? 'Dozent' : 'Trainer'}: {r.trainer}</div>}
            {r.notes && <div style={{ fontSize: 11, color: C.mutedLight, marginTop: 1 }}>{r.notes}</div>}
          </div>
          <button onClick={() => openEdit(r)} style={iconBtn}><Pencil size={12} color={C.muted} /></button>
          <button onClick={() => remove(r.id)} style={iconBtn}><Trash2 size={12} color={C.muted} /></button>
        </div>
      ))}

      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 460, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>{editId ? (de ? 'Eintrag bearbeiten' : 'Edit entry') : (de ? 'Unterrichtseintrag' : 'Teaching entry')}</div>
              <button onClick={() => !saving && setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Datum' : 'Date'}<DateField value={form.recordDate} onChange={(v) => set('recordDate', v)} /></label>
                <label style={{ ...lbl, width: 120 }}>{de ? 'Stunden (UE)' : 'Hours (UE)'}<input type="number" min={0} value={form.hours} onChange={(e) => set('hours', e.target.value)} style={inp} /></label>
              </div>
              <label style={lbl}>{de ? 'Thema / Inhalt' : 'Topic / content'}<input value={form.topic} onChange={(e) => set('topic', e.target.value)} style={inp} placeholder={de ? 'z.B. SQL Grundlagen' : 'e.g. SQL basics'} /></label>
              <label style={lbl}>{de ? 'Dozent' : 'Trainer'}<input value={form.trainer} onChange={(e) => set('trainer', e.target.value)} style={inp} /></label>
              <label style={lbl}>{de ? 'Notizen' : 'Notes'}<textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} style={{ ...inp, minHeight: 70, resize: 'vertical' }} /></label>
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
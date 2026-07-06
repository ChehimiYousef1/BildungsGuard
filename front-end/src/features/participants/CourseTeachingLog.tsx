import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, User, Calendar, ChevronDown, ChevronRight, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

export default function CourseTeachingLog({ participant }: { participant: any }) {
  const { lang } = useApp();
  const de = lang === 'de';

  const [courses,    setCourses]    = useState<any[]>([]);
  const [records,    setRecords]    = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [openCourse, setOpenCourse] = useState<string | null>(null);
  const [open,       setOpen]       = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [selCourse,  setSelCourse]  = useState('');

  const [form, setForm] = useState({
    courseId: '', topic: '', recordDate: '', trainer: '', hours: '', notes: '',
  });

  const measureId = participant?.measureId ?? participant?.measure?.id;

  const load = async () => {
    if (!measureId) { setLoading(false); return; }
    try {
      const [c, r] = await Promise.all([
        api<any[]>('/courses').catch(() => []),
        api<any[]>('/course-records').catch(() => []),
      ]);
      const mCourses    = (Array.isArray(c) ? c : []).filter((x) => x.measureId === measureId);
      const courseIds   = new Set(mCourses.map((x) => x.id));
      const teachingLog = (Array.isArray(r) ? r : []).filter((x) => courseIds.has(x.courseId));
      setCourses(mCourses);
      setRecords(teachingLog);
      if (mCourses.length > 0 && !selCourse) setSelCourse(mCourses[0].id);
    } catch { setCourses([]); setRecords([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [measureId]);

  const logsFor = (courseId: string) => records.filter((r) => r.courseId === courseId);

  const openNew = (courseId?: string) => {
    setEditId(null);
    setForm({
      courseId:   courseId ?? selCourse ?? courses[0]?.id ?? '',
      topic:      '',
      recordDate: new Date().toLocaleDateString('de-DE'),
      trainer:    '',
      hours:      '',
      notes:      '',
    });
    setOpen(true);
  };

  const openEdit = (r: any) => {
    setEditId(r.id);
    setForm({
      courseId:   r.courseId   ?? '',
      topic:      r.topic      ?? '',
      recordDate: r.recordDate ?? '',
      trainer:    r.trainer    ?? '',
      hours:      String(r.hours ?? ''),
      notes:      r.notes      ?? '',
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.topic.trim()) return;
    setSaving(true);
    try {
      const payload = {
        courseId:   form.courseId,
        type:       'TEACHING_LOG',
        topic:      form.topic.trim(),
        recordDate: form.recordDate.trim() || undefined,
        trainer:    form.trainer.trim()    || undefined,
        hours:      form.hours ? Number(form.hours) : undefined,
        notes:      form.notes.trim()      || undefined,
      };
      if (editId) {
        await api(`/course-records/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/course-records', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpen(false);
      await load();
    } catch (e) {
      console.error('Teaching log save failed', e);
      alert(de ? 'Fehler beim Speichern.' : 'Save failed.');
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Eintrag löschen?' : 'Delete entry?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/course-records/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      await load();
    } catch (e) { console.error(e); }
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (!measureId) return null;

  return (
    <div className="card" style={{ marginTop: 15 }}>
      <div className="card-head">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BookOpen size={15} color={C.iris} />
          {de ? 'Unterrichtsdokumentation (#24)' : 'Teaching documentation (#24)'} · {records.length}
        </div>
        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => openNew()}>
          <Plus size={13} /> {de ? 'Eintrag' : 'Add entry'}
        </button>
      </div>

      {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}

      {!loading && courses.length === 0 && (
        <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>
          {de ? 'Keine Kurse zugewiesen.' : 'No courses assigned.'}
        </div>
      )}

      {!loading && courses.map((course) => {
        const logs   = logsFor(course.id);
        const isOpen = openCourse === course.id;
        return (
          <div key={course.id} style={{ marginBottom: 8 }}>
            <div onClick={() => setOpenCourse(isOpen ? null : course.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: isOpen ? '10px 10px 0 0' : 10,
              background: isOpen ? C.iris + '0D' : C.soft,
              border: `1px solid ${isOpen ? C.iris : C.line}`,
              cursor: 'pointer',
            }}>
              {isOpen ? <ChevronDown size={14} color={C.iris} /> : <ChevronRight size={14} color={C.muted} />}
              <BookOpen size={14} color={isOpen ? C.iris : C.muted} />
              <div style={{ flex: 1, fontWeight: 600, fontSize: 13, color: isOpen ? C.iris : '#334155' }}>
                {course.name}
              </div>
              <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }}
                onClick={(e) => { e.stopPropagation(); openNew(course.id); }}>
                <Plus size={11} /> {de ? 'Hinzufügen' : 'Add'}
              </button>
              <span className="badge" style={{ background: C.iris + '18', color: C.iris, fontSize: 11 }}>
                {logs.length} {de ? 'Einträge' : 'entries'}
              </span>
            </div>

            {isOpen && (
              <div style={{ border: `1px solid ${C.iris}`, borderTop: 'none', borderRadius: '0 0 10px 10px', background: '#fff', overflow: 'hidden' }}>
                {logs.length === 0 && (
                  <div style={{ padding: '12px 14px', color: C.muted, fontSize: 13 }}>
                    {de ? 'Noch keine Einträge.' : 'No entries yet.'}
                  </div>
                )}
                {logs.map((log, i) => (
                  <div key={log.id} style={{
                    padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start',
                    borderBottom: i < logs.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{log.topic || (de ? 'Thema' : 'Topic')}</div>
                      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {log.recordDate && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Calendar size={11} /> {log.recordDate}</span>}
                        {log.trainer    && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><User    size={11} /> {log.trainer}</span>}
                        {log.hours      && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Clock   size={11} /> {log.hours} UE</span>}
                      </div>
                      {log.notes && <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 4, fontStyle: 'italic' }}>{log.notes}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button className="icon-mini" onClick={() => openEdit(log)}><Pencil size={12} color={C.muted} /></button>
                      <button className="icon-mini" onClick={() => remove(log.id)}><Trash2 size={12} color={C.rose} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* MODAL */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 460, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editId ? (de ? 'Eintrag bearbeiten' : 'Edit entry') : (de ? 'Unterrichtseinheit hinzufügen' : 'Add teaching unit')}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Kurs' : 'Course'}
                <select value={form.courseId} onChange={(e) => set('courseId', e.target.value)} style={inp}>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label style={lbl}>{de ? 'Thema / Titel *' : 'Topic / Title *'}
                <input value={form.topic} onChange={(e) => set('topic', e.target.value)}
                  style={inp} placeholder={de ? 'z.B. Einführung Python' : 'e.g. Python Introduction'} />
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Datum' : 'Date'}
                  <input value={form.recordDate} onChange={(e) => set('recordDate', e.target.value)} style={inp} placeholder="TT.MM.JJJJ" />
                </label>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'UE (Stunden)' : 'Teaching units'}
                  <input type="number" min="1" value={form.hours} onChange={(e) => set('hours', e.target.value)} style={inp} placeholder="4" />
                </label>
              </div>
              <label style={lbl}>{de ? 'Dozent' : 'Trainer'}
                <input value={form.trainer} onChange={(e) => set('trainer', e.target.value)} style={inp} placeholder="Dr. Elena Alvarez" />
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
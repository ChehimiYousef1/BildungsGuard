import React, { useState, useEffect, useRef } from 'react';
import {
  Library, Plus, ChevronUp, ChevronDown, CheckCircle2,
  Play, Circle, Award, ChevronRight, BookOpen,
  CalendarClock, Trash2, Pencil, X, Upload, Video,
  Radio, Layers, Link, Eye
} from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';
import { translateText } from '../../lib/translateName';

const API = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export default function Content() {
  const { t, lang } = useApp();
  const de = lang === 'de';

  const [measures,   setMeasures]   = useState<any[]>([]);
  const [courses,    setCourses]    = useState<any[]>([]);
  const [sessions,   setSessions]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [selMeasure, setSelMeasure] = useState<string>('');
  const [openCourse, setOpenCourse] = useState<string | null>(null);
  const tName = (m: any) => translateText(m?.name ?? '', lang);

  // Course modal
  const [courseOpen,   setCourseOpen]   = useState(false);
  const [editCourse,   setEditCourse]   = useState<any | null>(null);
  const [courseSaving, setCourseSaving] = useState(false);
  const [courseForm,   setCourseForm]   = useState({ name: '', description: '' });

  // Session modal
  const [sessOpen,     setSessOpen]     = useState(false);
  const [editSess,     setEditSess]     = useState<any | null>(null);
  const [sessCourseId, setSessCourseId] = useState('');
  const [sessSaving,   setSessSaving]   = useState(false);
  const [sessForm,     setSessForm]     = useState({ title: '', time: '', room: '', meetingUrl: '', videoRef: '' });

  // Video upload
  const [uploading,    setUploading]    = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingSessId, setPendingSessId] = useState<string | null>(null);

  const load = async () => {
    try {
      const [m, c, s] = await Promise.all([
        api<any[]>('/measures').catch(() => []),
        api<any[]>('/courses').catch(() => []),
        api<any[]>('/sessions').catch(() => []),
      ]);
      const mList = Array.isArray(m) ? m : [];
      setMeasures(mList);
      setCourses(Array.isArray(c) ? c : []);
      setSessions(Array.isArray(s) ? s : []);
      if (mList.length > 0 && !selMeasure) setSelMeasure(mList[0].id);
    } catch { }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filteredCourses = courses.filter((c) => c.measureId === selMeasure);
  const sessForCourse   = (courseId: string) =>
    sessions.filter((s) => s.courseId === courseId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // ===== Course CRUD =====
  const openAddCourse = () => {
    setEditCourse(null);
    setCourseForm({ name: '', description: '' });
    setCourseOpen(true);
  };
  const openEditCourse = (c: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditCourse(c);
    setCourseForm({ name: c.name ?? '', description: c.description ?? '' });
    setCourseOpen(true);
  };
  const submitCourse = async () => {
    if (!courseForm.name.trim()) return;
    setCourseSaving(true);
    try {
      if (editCourse) {
        await api(`/courses/${editCourse.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: courseForm.name.trim(), description: courseForm.description.trim() || undefined }),
        });
      } else {
        await api('/courses', {
          method: 'POST',
          body: JSON.stringify({
            name:        courseForm.name.trim(),
            description: courseForm.description.trim() || undefined,
            measureId:   selMeasure,
            order:       filteredCourses.length + 1,
          }),
        });
      }
      setCourseOpen(false);
      await load();
    } catch (e) { console.error(e); }
    finally { setCourseSaving(false); }
  };
  const deleteCourse = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(de ? 'Kurs löschen?' : 'Delete course?')) return;
    try { await api(`/courses/${id}`, { method: 'DELETE' }); await load(); }
    catch (e) { console.error(e); }
  };

  // ===== Session CRUD =====
  const openAddSess = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditSess(null);
    setSessCourseId(courseId);
    setSessForm({ title: '', time: '', room: '', meetingUrl: '', videoRef: '' });
    setSessOpen(true);
  };
  const openEditSess = (s: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditSess(s);
    setSessCourseId(s.courseId);
    setSessForm({
      title:      s.title      ?? '',
      time:       s.time       ?? '',
      room:       s.room       ?? '',
      meetingUrl: s.meetingUrl ?? '',
      videoRef:   s.videoRef   ?? '',
    });
    setSessOpen(true);
  };
  const submitSess = async () => {
    if (!sessForm.title.trim()) return;
    setSessSaving(true);
    try {
      const payload: any = {
        title:      sessForm.title.trim(),
        time:       sessForm.time.trim()       || undefined,
        room:       sessForm.room.trim()       || undefined,
        meetingUrl: sessForm.meetingUrl.trim() || undefined,
        videoRef:   sessForm.videoRef.trim()   || undefined,
      };
      if (editSess) {
        await api(`/sessions/${editSess.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/sessions', {
          method: 'POST',
          body: JSON.stringify({ ...payload, courseId: sessCourseId, order: sessForCourse(sessCourseId).length + 1 }),
        });
      }
      setSessOpen(false);
      await load();
    } catch (e) { console.error(e); }
    finally { setSessSaving(false); }
  };
  const deleteSess = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(de ? 'Sitzung löschen?' : 'Delete session?')) return;
    try { await api(`/sessions/${id}`, { method: 'DELETE' }); await load(); }
    catch (e) { console.error(e); }
  };

  // ===== Video upload =====
  const triggerUpload = (sessId: string) => {
    setPendingSessId(sessId);
    fileRef.current?.click();
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingSessId) return;
    setUploading(pendingSessId);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append('file', file);
      const uploadUrl = `${API}/sessions/${pendingSessId}/video`;
      console.log('[Video Upload] URL:', uploadUrl, '| File:', file.name, file.size);
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('[Video Upload] Failed:', res.status, errText);
        throw new Error(`${res.status}: ${errText}`);
      }
      const data = await res.json();
      console.log('[Video Upload] Success:', data.videoRef);
      await load();
    } catch (err) {
      console.error('[Video Upload] Error:', err);
      alert((de ? 'Upload fehlgeschlagen: ' : 'Upload failed: ') + String(err));
    } finally {
      setUploading(null);
      setPendingSessId(null);
      e.target.value = '';
    }
  };

  // ===== Toggle Live =====
  const toggleLive = async (sess: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = sess.meetingUrl
      ? ''
      : prompt(de ? 'Meeting-URL eingeben:' : 'Enter meeting URL:', 'https://meet.google.com/...');
    if (url === null) return;
    try {
      await api(`/sessions/${sess.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ meetingUrl: url || undefined }),
      });
      await load();
    } catch (e) { console.error(e); }
  };

  const selectedMeasure = measures.find((m) => m.id === selMeasure);
  const totalSessions   = filteredCourses.reduce((s, c) => s + sessForCourse(c.id).length, 0);

  return (
    <>
      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="video/*,.mp4,.mov,.webm" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* ===== HEADER ===== */}
      <div className="card" style={{ marginBottom: 15 }}>
        <div className="card-head">
          <div className="card-title">
            <Library size={15} color={C.iris} style={{ marginRight: 6 }} />
            {de ? 'Lerninhalt' : 'Learning Content'}
          </div>
          <button className="btn btn-primary" style={{ padding: '7px 13px', fontSize: 12 }}
            onClick={openAddCourse} disabled={!selMeasure}>
            <Plus size={13} /> {de ? 'Kurs hinzufügen' : 'Add course'}
          </button>
        </div>

        {/* ✅ Bootcamp tabs with translated names */}
        {measures.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {measures.map((m) => (
              <button key={m.id} onClick={() => { setSelMeasure(m.id); setOpenCourse(null); }}
                style={{
                  padding: '6px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${selMeasure === m.id ? C.iris : C.line}`,
                  background: selMeasure === m.id ? C.iris : '#fff',
                  color: selMeasure === m.id ? '#fff' : C.inkSoft,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                <Layers size={11} /> {tName(m)}
              </button>
            ))}
          </div>
        )}

        {/* Stats */}
        {selectedMeasure && (
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <div style={{ padding: '7px 13px', borderRadius: 9, background: C.iris + '10', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 17, color: C.iris }}>{filteredCourses.length}</span>
              <span style={{ fontSize: 12, color: C.muted }}>{de ? 'Kurse' : 'Courses'}</span>
            </div>
            <div style={{ padding: '7px 13px', borderRadius: 9, background: C.amber + '10', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 17, color: C.amber }}>{totalSessions}</span>
              <span style={{ fontSize: 12, color: C.muted }}>{de ? 'Sitzungen' : 'Sessions'}</span>
            </div>
          </div>
        )}
      </div>

      {loading && <div className="card" style={{ padding: 20, color: C.muted, fontSize: 13 }}>...</div>}

      {!loading && filteredCourses.length === 0 && selMeasure && (
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <BookOpen size={34} color={C.mutedLight} style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
            {de ? 'Noch keine Kurse' : 'No courses yet'}
          </div>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>
            {de ? 'Füge den ersten Kurs für dieses Bootcamp hinzu.' : 'Add the first course for this bootcamp.'}
          </div>
          <button className="btn btn-primary" style={{ padding: '9px 18px' }} onClick={openAddCourse}>
            <Plus size={14} /> {de ? 'Ersten Kurs erstellen' : 'Create first course'}
          </button>
        </div>
      )}

      {/* ===== COURSES ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!loading && filteredCourses.map((course, ci) => {
          const cSessions = sessForCourse(course.id);
          const isOpen    = openCourse === course.id;
          const hasLive   = cSessions.some((s) => s.meetingUrl);
          const hasVideo  = cSessions.some((s) => s.videoRef);

          return (
            <div key={course.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>

              {/* Course header */}
              <div
                onClick={() => setOpenCourse(isOpen ? null : course.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                  cursor: 'pointer',
                  background: isOpen ? C.iris + '08' : '#fff',
                  borderBottom: isOpen ? `1px solid ${C.line}` : 'none',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: isOpen ? C.iris : C.soft,
                  display: 'grid', placeItems: 'center',
                  fontSize: 14, fontWeight: 800, color: isOpen ? '#fff' : C.muted,
                }}>
                  {ci + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: isOpen ? C.iris : '#334155' }}>
                    {course.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span>
                      <CalendarClock size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                      {cSessions.length} {de ? 'Sitzungen' : 'sessions'}
                    </span>
                    {hasLive && (
                      <span style={{ color: C.rose, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Radio size={11} /> Live
                      </span>
                    )}
                    {hasVideo && (
                      <span style={{ color: C.iris, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Video size={11} /> Video
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={(e) => openAddSess(course.id, e)}>
                    <Plus size={11} /> {de ? 'Sitzung' : 'Session'}
                  </button>
                  <button className="icon-mini" title={de ? 'Bearbeiten' : 'Edit'} onClick={(e) => openEditCourse(course, e)}>
                    <Pencil size={13} color={C.muted} />
                  </button>
                  <button className="icon-mini" title={de ? 'Löschen' : 'Delete'} onClick={(e) => deleteCourse(course.id, e)}>
                    <Trash2 size={13} color={C.muted} />
                  </button>
                </div>
                {isOpen ? <ChevronDown size={15} color={C.iris} /> : <ChevronRight size={15} color={C.muted} />}
              </div>

              {/* Sessions */}
              {isOpen && (
                <div style={{ background: '#fafafa' }}>
                  {cSessions.length === 0 && (
                    <div style={{ padding: '14px 16px', color: C.muted, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span>{de ? 'Noch keine Sitzungen.' : 'No sessions yet.'}</span>
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 11 }}
                        onClick={(e) => openAddSess(course.id, e)}>
                        <Plus size={11} /> {de ? 'Erste Sitzung' : 'First session'}
                      </button>
                    </div>
                  )}

                  {cSessions.map((session, si) => (
                    <div key={session.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
                      borderBottom: si < cSessions.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        background: C.iris + '12', display: 'grid', placeItems: 'center',
                        fontSize: 11, fontWeight: 700, color: C.iris,
                      }}>
                        {session.order ?? si + 1}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{session.title}</div>
                        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {session.time && <span>{session.time}</span>}
                          {session.room && <span>{session.room}</span>}
                          {session.meetingUrl && (
                            <span style={{ color: C.rose, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <Radio size={10} /> Live
                            </span>
                          )}
                          {session.videoRef && (
                            <span style={{ color: C.iris, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <Video size={10} /> {de ? 'Video vorhanden' : 'Video ready'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'center' }}>
                        <button
                          title={session.meetingUrl ? (de ? 'Live-Link entfernen' : 'Remove live link') : (de ? 'Live-Link setzen' : 'Set live link')}
                          onClick={(e) => toggleLive(session, e)}
                          style={{
                            padding: '5px 9px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                            border: `1.5px solid ${session.meetingUrl ? C.rose : C.line}`,
                            background: session.meetingUrl ? C.rose + '12' : '#fff',
                            color: session.meetingUrl ? C.rose : C.muted,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                          <Radio size={11} /> Live
                        </button>

                        <button
                          title={session.videoRef ? (de ? 'Video ersetzen' : 'Replace video') : (de ? 'Video hochladen' : 'Upload video')}
                          disabled={uploading === session.id}
                          onClick={() => triggerUpload(session.id)}
                          style={{
                            padding: '5px 9px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                            border: `1.5px solid ${session.videoRef ? C.iris : C.line}`,
                            background: session.videoRef ? C.iris + '12' : '#fff',
                            color: session.videoRef ? C.iris : C.muted,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                          {uploading === session.id ? '...' : <><Upload size={11} /> Video</>}
                        </button>

                        {session.videoRef && (
                          <button
                            title={de ? 'Video ansehen' : 'Watch video'}
                            onClick={() => window.open(session.videoRef, '_blank', 'noopener')}
                            style={{ padding: '5px 8px', borderRadius: 7, border: `1px solid ${C.line}`, background: '#fff', cursor: 'pointer' }}>
                            <Eye size={13} color={C.muted} />
                          </button>
                        )}

                        {session.meetingUrl && (
                          <button
                            title={de ? 'Meeting öffnen' : 'Open meeting'}
                            onClick={() => window.open(session.meetingUrl, '_blank', 'noopener')}
                            style={{ padding: '5px 8px', borderRadius: 7, border: `1px solid ${C.line}`, background: '#fff', cursor: 'pointer' }}>
                            <Link size={13} color={C.muted} />
                          </button>
                        )}

                        <button className="icon-mini" title={de ? 'Bearbeiten' : 'Edit'} onClick={(e) => openEditSess(session, e)}>
                          <Pencil size={13} color={C.muted} />
                        </button>
                        <button className="icon-mini" title={de ? 'Löschen' : 'Delete'} onClick={(e) => deleteSess(session.id, e)}>
                          <Trash2 size={13} color={C.muted} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {cSessions.length > 0 && (
                    <div style={{ padding: '10px 16px', borderTop: `1px solid ${C.lineSoft}` }}>
                      <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 5 }}
                        onClick={(e) => openAddSess(course.id, e)}>
                        <Plus size={12} /> {de ? 'Sitzung hinzufügen' : 'Add session'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== COURSE MODAL ===== */}
      {courseOpen && (
        <div onClick={() => !courseSaving && setCourseOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 420, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editCourse ? (de ? 'Kurs bearbeiten' : 'Edit course') : (de ? 'Neuen Kurs erstellen' : 'Create new course')}
              </div>
              <button onClick={() => setCourseOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Kursname *' : 'Course name *'}
                <input value={courseForm.name} onChange={(e) => setCourseForm((f) => ({ ...f, name: e.target.value }))}
                  style={inp} placeholder={de ? 'z.B. Python Grundlagen' : 'e.g. Python basics'} autoFocus />
              </label>
              <label style={lbl}>{de ? 'Beschreibung' : 'Description'}
                <input value={courseForm.description} onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
                  style={inp} placeholder={de ? 'Optional...' : 'Optional...'} />
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={courseSaving} onClick={() => setCourseOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={courseSaving || !courseForm.name.trim()} onClick={submitCourse}>
                  {courseSaving ? '...' : (editCourse ? (de ? 'Speichern' : 'Save') : (de ? 'Erstellen' : 'Create'))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SESSION MODAL ===== */}
      {sessOpen && (
        <div onClick={() => !sessSaving && setSessOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 460, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editSess ? (de ? 'Sitzung bearbeiten' : 'Edit session') : (de ? 'Neue Sitzung erstellen' : 'Create new session')}
              </div>
              <button onClick={() => setSessOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Titel *' : 'Title *'}
                <input value={sessForm.title} onChange={(e) => setSessForm((f) => ({ ...f, title: e.target.value }))}
                  style={inp} placeholder={de ? 'z.B. Python Einführung' : 'e.g. Python Introduction'} autoFocus />
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Uhrzeit' : 'Time'}
                  <input value={sessForm.time} onChange={(e) => setSessForm((f) => ({ ...f, time: e.target.value }))}
                    style={inp} placeholder="09:00-12:15" />
                </label>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Raum' : 'Room'}
                  <input value={sessForm.room} onChange={(e) => setSessForm((f) => ({ ...f, room: e.target.value }))}
                    style={inp} placeholder="Room 1 / Online" />
                </label>
              </div>
              <label style={lbl}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Radio size={12} color={C.rose} /> {de ? 'Live Meeting URL' : 'Live Meeting URL'}
                </span>
                <input value={sessForm.meetingUrl} onChange={(e) => setSessForm((f) => ({ ...f, meetingUrl: e.target.value }))}
                  style={inp} placeholder="https://meet.google.com/..." />
              </label>
              <label style={lbl}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Video size={12} color={C.iris} /> {de ? 'Video URL (optional)' : 'Video URL (optional)'}
                </span>
                <input value={sessForm.videoRef} onChange={(e) => setSessForm((f) => ({ ...f, videoRef: e.target.value }))}
                  style={inp} placeholder="https://..." />
              </label>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={sessSaving} onClick={() => setSessOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={sessSaving || !sessForm.title.trim()} onClick={submitSess}>
                  {sessSaving ? '...' : (editSess ? (de ? 'Speichern' : 'Save') : (de ? 'Erstellen' : 'Create'))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16,
};
const lbl: React.CSSProperties = { fontSize: 12.5, color: '#334155', display: 'flex', flexDirection: 'column', gap: 1 };
const inp: React.CSSProperties = {
  marginTop: 5, padding: '9px 11px', borderRadius: 9,
  border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', width: '100%',
};

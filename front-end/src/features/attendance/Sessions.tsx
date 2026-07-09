import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  ChevronRight, ChevronDown, BookOpen, CalendarClock,
  Users, Play, CheckCircle2, Clock, Layers, X, Pencil, Trash2, Download
} from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';
import { MASSNAHMEN, TEMPLATE_SESSIONS } from '../../data';
import { SESSIONS } from '../../data/attendance';
import { translateText } from '../../lib/translateName';
import AttGrid from './AttendanceGrid';

const API_URL = (import.meta as any).env?.VITE_API_URL ?? '/api';

const buildCourses = (measureId: string, measureName: string) =>
  TEMPLATE_SESSIONS.map((s, i) => ({
    id: `${measureId}-course-${s.id}`, measureId,
    name: measureName.includes('Data') ? s.de : s.en, order: i + 1,
  }));

const buildSessions = (courseId: string, measureName: string, courseName: string, lang: string) => {
  const matching = SESSIONS.filter((s) =>
    measureName.toLowerCase().includes(s.m?.toLowerCase() ?? '') ||
    s.m?.toLowerCase().includes(measureName.split(' ')[0]?.toLowerCase() ?? '')
  );
  if (matching.length > 0) {
    return matching.map((s, i) => ({
      id: `${courseId}-sess-${i}`, courseId,
      title: lang === 'de' ? s.tde : s.ten,
      time: s.time, room: s.room, trainer: s.doz,
      participantCount: s.total, present: s.present,
      status: s.status, order: i + 1,
    }));
  }
  return [];
};

export default function Sessions() {
  const { lang } = useApp();
  const de = lang === 'de';
  const toast = (useApp() as any).toast;

  const [measures,    setMeasures]    = useState<any[]>([]);
  const [courses,     setCourses]     = useState<Record<string, any[]>>({});
  const [sessions,    setSessions]    = useState<Record<string, any[]>>({});
  const [partsByMeas, setPartsByMeas] = useState<Record<string, number>>({});
  const [loading,     setLoading]     = useState(true);

  const [openMeasure, setOpenMeasure] = useState<string | null>(null);
  const [openCourse,  setOpenCourse]  = useState<string | null>(null);
  const [selSession,  setSelSession]  = useState<any | null>(null);

  // Add session modal
  const [addOpen,     setAddOpen]     = useState(false);
  const [addCourseId, setAddCourseId] = useState('');
  const [addSaving,   setAddSaving]   = useState(false);
  const [addForm,     setAddForm]     = useState({ title: '', time: '', room: '' });

  // Edit session modal
  const [editOpen,    setEditOpen]    = useState(false);
  const [editSess,    setEditSess]    = useState<any | null>(null);
  const [editSaving,  setEditSaving]  = useState(false);
  const [editForm,    setEditForm]    = useState({ title: '', time: '', room: '' });

  const tMeasure = (m: any) => translateText(m?.name ?? '', lang);

  const loadAll = async () => {
    try {
      const [apiMeasures, apiCourses, apiSessions, apiParticipants] = await Promise.all([
        api<any[]>('/measures').catch(() => []),
        api<any[]>('/courses').catch(() => []),
        api<any[]>('/sessions').catch(() => []),
        api<any[]>('/participants').catch(() => []),
      ]);

      const mList = Array.isArray(apiMeasures) && apiMeasures.length > 0
        ? apiMeasures
        : MASSNAHMEN.map((m) => ({ id: m.id, name: m.name, number: m.nr, status: m.status, enrolled: m.enrolled }));
      setMeasures(mList);

      const parts = Array.isArray(apiParticipants) ? apiParticipants : [];
      const partMap: Record<string, number> = {};
      mList.forEach((m) => {
        partMap[m.id] = parts.filter((p) => p.measureId === m.id || p.measure?.id === m.id).length;
      });
      setPartsByMeas(partMap);

      const courseMap:  Record<string, any[]> = {};
      const sessionMap: Record<string, any[]> = {};

      mList.forEach((m) => {
        const mCourses = Array.isArray(apiCourses) && apiCourses.length > 0
          ? apiCourses.filter((c: any) => c.measureId === m.id)
          : buildCourses(m.id, m.name);
        courseMap[m.id] = mCourses;

        mCourses.forEach((c: any) => {
          const cSessions = Array.isArray(apiSessions) && apiSessions.length > 0
            ? apiSessions.filter((s: any) => s.courseId === c.id)
            : buildSessions(c.id, m.name, c.name, lang);
          sessionMap[c.id] = cSessions;
        });
      });

      setCourses(courseMap);
      setSessions(sessionMap);

      if (mList.length > 0 && !openMeasure) setOpenMeasure(mList[0].id);
    } catch {
      const mList = MASSNAHMEN.map((m) => ({ id: m.id, name: m.name, number: m.nr, status: m.status, enrolled: m.enrolled }));
      setMeasures(mList);
      const courseMap: Record<string, any[]> = {};
      const sessionMap: Record<string, any[]> = {};
      const partMap: Record<string, number> = {};
      mList.forEach((m) => {
        courseMap[m.id]  = buildCourses(m.id, m.name);
        partMap[m.id]    = m.enrolled ?? 0;
        courseMap[m.id].forEach((c) => { sessionMap[c.id] = buildSessions(c.id, m.name, c.name, lang); });
      });
      setCourses(courseMap);
      setSessions(sessionMap);
      setPartsByMeas(partMap);
      if (mList.length > 0) setOpenMeasure(mList[0].id);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, [lang]);

  // ===== Add Session =====
  const openAdd = (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddCourseId(courseId);
    setAddForm({ title: '', time: '', room: '' });
    setAddOpen(true);
  };

  const submitAdd = async () => {
    if (!addForm.title.trim()) return;
    setAddSaving(true);
    try {
      await api('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          courseId: addCourseId,
          title:    addForm.title.trim(),
          time:     addForm.time.trim()  || undefined,
          room:     addForm.room.trim()  || undefined,
          order:    (sessions[addCourseId]?.length ?? 0) + 1,
        }),
      });
      setAddOpen(false);
      await loadAll();
      toast?.success(de ? 'Sitzung erstellt!' : 'Session created!');
    } catch (e) {
      console.error('create session failed', e);
      toast?.error(de ? 'Fehler beim Erstellen.' : 'Failed to create session.');
    } finally { setAddSaving(false); }
  };

  // ===== Edit Session =====
  const openEdit = (sess: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditSess(sess);
    setEditForm({ title: sess.title ?? '', time: sess.time ?? '', room: sess.room ?? '' });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editSess || !editForm.title.trim()) return;
    setEditSaving(true);
    try {
      await api(`/sessions/${editSess.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editForm.title.trim(),
          time:  editForm.time.trim()  || undefined,
          room:  editForm.room.trim()  || undefined,
        }),
      });
      setEditOpen(false);
      await loadAll();
      toast?.success(de ? 'Sitzung aktualisiert!' : 'Session updated!');
    } catch (e) {
      console.error('update session failed', e);
      toast?.error(de ? 'Fehler beim Bearbeiten.' : 'Failed to update session.');
    } finally { setEditSaving(false); }
  };

  // ===== Delete Session =====
  const deleteSession = async (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(de ? 'Sitzung löschen?' : 'Delete session?')) return;
    try {
      const token = getToken();
      await fetch(`${API_URL}/sessions/${sessId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      await loadAll();
    } catch (e) { console.error('delete session failed', e); }
  };

  const totalCourses  = Object.values(courses).reduce((s, c) => s + c.length, 0);
  const totalSessions = Object.values(sessions).reduce((s, arr) => s + arr.length, 0);
  const totalParts    = Object.values(partsByMeas).reduce((s, n) => s + n, 0);


  // ===== EXPORT ALL ATTENDANCE =====
  const exportAll = async () => {
    try {
      // جمع كل الـ attendance من كل الـ sessions
      const allRows: any[] = [];

      for (const measure of measures) {
        const mCourses = courses[measure.id] ?? [];
        for (const course of mCourses) {
          const cSessions = sessions[course.id] ?? [];
          for (const session of cSessions) {
            const att = await api<any[]>(`/attendance/${session.id}`).catch(() => []);
            if (Array.isArray(att)) {
              att.forEach((a: any) => {
                allRows.push({
                  [de ? 'Bootcamp'      : 'Bootcamp']:    tMeasure(measure),
                  [de ? 'Kurs'          : 'Course']:       course.name,
                  [de ? 'Sitzung'       : 'Session']:      session.title || `Session ${session.order ?? ''}`,
                  [de ? 'Uhrzeit'       : 'Time']:         session.time ?? '',
                  [de ? 'Raum'          : 'Room']:         session.room ?? '',
                  [de ? 'Teilnehmer'    : 'Participant']:  a.participant?.name ?? a.participantId ?? '',
                  [de ? 'Anwesenheit'   : 'Status']:
                    a.status === 'present'  ? (de ? 'Anwesend'    : 'Present')
                  : a.status === 'excused'  ? (de ? 'Entschuldigt': 'Excused')
                  : a.present === true      ? (de ? 'Anwesend'    : 'Present')
                  :                           (de ? 'Abwesend'    : 'Absent'),
                });
              });
            }
          }
        }
      }

      if (allRows.length === 0) {
        alert(de ? 'Keine Anwesenheitsdaten gefunden.' : 'No attendance data found.');
        return;
      }

      const ws = XLSX.utils.json_to_sheet(allRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, de ? 'Anwesenheit' : 'Attendance');
      ws['!cols'] = [{ wch: 22 }, { wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 22 }, { wch: 14 }];
      XLSX.writeFile(wb, `attendance_all_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (e) {
      console.error('export failed', e);
      alert(de ? 'Export fehlgeschlagen.' : 'Export failed.');
    }
  };

  if (selSession) {
    return <AttGrid session={selSession} back={() => setSelSession(null)} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ===== HEADER STATS ===== */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <CalendarClock size={18} color={C.iris} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{de ? 'Anwesenheit' : 'Attendance'}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
              {de ? 'Bootcamp → Kurs → Sitzung' : 'Bootcamp → Course → Session'}
            </div>
          </div>
        </div>

        <button
            className="btn btn-ghost"
            style={{ padding: '7px 13px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={exportAll}
          >
            <Download size={14} /> {de ? 'Alle exportieren' : 'Export all'}
          </button>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            [<Layers size={13} />,        measures.length,  de ? 'Bootcamps'  : 'Bootcamps',    C.iris],
            [<BookOpen size={13} />,      totalCourses,     de ? 'Kurse'      : 'Courses',      C.amber],
            [<CalendarClock size={13} />, totalSessions,    de ? 'Sitzungen'  : 'Sessions',     C.mint],
            [<Users size={13} />,         totalParts,       de ? 'Teilnehmer' : 'Participants', C.iris],
          ].map(([icon, count, label, color]: any, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 9, background: color + '12' }}>
              <span style={{ color }}>{icon}</span>
              <span style={{ fontWeight: 800, fontSize: 15, color }}>{count}</span>
              <span style={{ fontSize: 11.5, color: C.muted }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {loading && <div className="card" style={{ padding: 20, color: C.muted, fontSize: 13 }}>...</div>}

      {!loading && measures.length === 0 && (
        <div className="card" style={{ padding: 20, color: C.muted, fontSize: 13 }}>
          {de ? 'Keine Bootcamps gefunden.' : 'No bootcamps found.'}
        </div>
      )}

      {/* ===== BOOTCAMPS ===== */}
      {!loading && measures.map((measure) => {
        const mCourses  = courses[measure.id]    ?? [];
        const isMOpen   = openMeasure === measure.id;
        const totalSess = mCourses.reduce((sum, c) => sum + (sessions[c.id]?.length ?? 0), 0);
        const partCount = partsByMeas[measure.id] ?? 0;

        return (
          <div key={measure.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>

            {/* BOOTCAMP ROW */}
            <div
              onClick={() => { setOpenMeasure(isMOpen ? null : measure.id); setOpenCourse(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer',
                background: isMOpen ? C.iris + '08' : '#fff',
                borderBottom: isMOpen ? `1px solid ${C.line}` : 'none',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: isMOpen ? C.iris : C.soft, display: 'grid', placeItems: 'center' }}>
                <BookOpen size={19} color={isMOpen ? '#fff' : C.muted} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: isMOpen ? C.iris : '#334155' }}>
                  {/* ✅ اسم الـ Bootcamp المترجم */}
                  {tMeasure(measure)}
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {measure.number && <span>Nr. {measure.number}</span>}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <BookOpen size={11} /> {mCourses.length} {de ? 'Kurse' : 'courses'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <CalendarClock size={11} /> {totalSess} {de ? 'Sitzungen' : 'sessions'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: partCount > 0 ? C.iris : C.muted }}>
                    <Users size={11} /> {partCount} {de ? 'TN' : 'participants'}
                  </span>
                </div>
              </div>

              <span className="badge" style={{
                background: measure.status === 'running' ? C.mint + '18' : measure.status === 'finishing' ? C.amber + '18' : C.line,
                color:      measure.status === 'running' ? C.mint : measure.status === 'finishing' ? C.amber : C.muted,
                fontSize: 11,
              }}>
                {measure.status === 'running'   ? (de ? 'Laufend'   : 'Running')
               : measure.status === 'finishing' ? (de ? 'Abschluss' : 'Finishing')
               : measure.status === 'planned'   ? (de ? 'Geplant'   : 'Planned')
               : measure.status}
              </span>

              {isMOpen ? <ChevronDown size={16} color={C.iris} /> : <ChevronRight size={16} color={C.muted} />}
            </div>

            {/* ===== COURSES ===== */}
            {isMOpen && (
              <div style={{ padding: '10px 12px 12px', background: C.iris + '04' }}>
                {mCourses.length === 0 && (
                  <div style={{ padding: '10px 6px', color: C.muted, fontSize: 13 }}>
                    {de ? 'Keine Kurse.' : 'No courses.'}
                  </div>
                )}

                {mCourses.map((course) => {
                  const cSessions = sessions[course.id] ?? [];
                  const isCOpen   = openCourse === course.id;
                  const captured  = cSessions.filter((s) => s.status === 'captured').length;

                  return (
                    <div key={course.id} style={{ marginBottom: 8 }}>

                      {/* COURSE ROW */}
                      <div
                        onClick={() => setOpenCourse(isCOpen ? null : course.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                          borderRadius: isCOpen ? '10px 10px 0 0' : 10,
                          background: isCOpen ? C.amber + '0D' : '#fff',
                          border: `1px solid ${isCOpen ? C.amber : C.line}`,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: isCOpen ? C.amber : C.soft, display: 'grid', placeItems: 'center' }}>
                          <CalendarClock size={14} color={isCOpen ? '#fff' : C.muted} />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: isCOpen ? C.amber : '#334155' }}>
                            {course.name}
                          </div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2, display: 'flex', gap: 8 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <CalendarClock size={10} /> {cSessions.length} {de ? 'Sitzungen' : 'sessions'}
                            </span>
                            {captured > 0 && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: C.mint }}>
                                <CheckCircle2 size={10} /> {captured} {de ? 'erfasst' : 'captured'}
                              </span>
                            )}
                          </div>
                        </div>

  

                        {isCOpen ? <ChevronDown size={14} color={C.amber} /> : <ChevronRight size={14} color={C.muted} />}
                      </div>

                      {/* ===== SESSIONS ===== */}
                      {isCOpen && (
                        <div style={{ border: `1px solid ${C.amber}`, borderTop: 'none', borderRadius: '0 0 10px 10px', background: '#fff', overflow: 'hidden' }}>

                          {cSessions.length === 0 && (
                            <div style={{ padding: '12px 14px' }}>
                              <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>
                                {de ? 'Noch keine Sitzungen.' : 'No sessions yet.'}
                              </div>
  
                            </div>
                          )}

                          {cSessions.map((session, i) => {
                            const isCaptured = session.status === 'captured';
                            const isOpenS    = session.status === 'openS' || session.status === 'open';
                            const attPct     = session.participantCount > 0
                              ? Math.round((session.present / session.participantCount) * 100)
                              : null;

                            return (
                              <div
                                key={session.id}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                                  borderBottom: i < cSessions.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
                                  cursor: 'pointer',
                                }}
                                className="row"
                                onClick={() => setSelSession(session)}
                              >
                                <div style={{
                                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                  background: isCaptured ? C.mint + '18' : C.iris + '12',
                                  color: isCaptured ? C.mint : C.iris,
                                  display: 'grid', placeItems: 'center',
                                  fontSize: 11, fontWeight: 700,
                                }}>
                                  {session.order ?? i + 1}
                                </div>

                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                                    {session.title || `${de ? 'Sitzung' : 'Session'} ${session.order ?? i + 1}`}
                                  </div>
                                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {session.time && <span>{session.time}</span>}
                                    {session.room && <span>{session.room}</span>}
                                    {session.trainer && session.trainer !== '—' && <span>{session.trainer}</span>}
                                  </div>
                                </div>

                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                  {isCaptured && attPct !== null ? (
                                    <div>
                                      <div style={{ fontSize: 13, fontWeight: 700, color: attPct >= 80 ? C.mint : C.amber }}>
                                        {session.present}/{session.participantCount}
                                      </div>
                                      <div style={{ fontSize: 10, color: C.muted }}>{attPct}%</div>
                                    </div>
                                  ) : null}
                                </div>

                                {isCaptured ? (
                                  <span className="badge" style={{ background: C.mint + '18', color: C.mint, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                    <CheckCircle2 size={11} /> {de ? 'Erfasst' : 'Captured'}
                                  </span>
                                ) : isOpenS ? (
                                  <span className="badge" style={{ background: C.amber + '18', color: C.amber, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                    <Clock size={11} /> {de ? 'Offen' : 'Open'}
                                  </span>
                                ) : null}

                                <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                                  <button className="icon-mini" title="Edit" onClick={(e) => openEdit(session, e)}>
                                    <Pencil size={12} color={C.muted} />
                                  </button>
                                  <button className="icon-mini" title="Delete" onClick={(e) => deleteSession(session.id, e)}>
                                    <Trash2 size={12} color={C.muted} />
                                  </button>
                                </div>

                                <button
                                  className="btn btn-primary"
                                  style={{ padding: '6px 11px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                                  onClick={(e) => { e.stopPropagation(); setSelSession(session); }}
                                >
                                  <Play size={11} />
                                  {de ? 'Anwesenheit' : 'Attendance'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* ===== EDIT SESSION MODAL ===== */}
      {editOpen && (
        <div onClick={() => !editSaving && setEditOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 420, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {de ? 'Sitzung bearbeiten' : 'Edit session'}
              </div>
              <button onClick={() => setEditOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Titel *' : 'Title *'}
                <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  style={inp} />
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Uhrzeit' : 'Time'}
                  <input value={editForm.time} onChange={(e) => setEditForm((f) => ({ ...f, time: e.target.value }))}
                    style={inp} placeholder="09:00-12:15" />
                </label>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Raum' : 'Room'}
                  <input value={editForm.room} onChange={(e) => setEditForm((f) => ({ ...f, room: e.target.value }))}
                    style={inp} placeholder="Room 1" />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={editSaving} onClick={() => setEditOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={editSaving || !editForm.title.trim()} onClick={submitEdit}>
                  {editSaving ? '...' : (de ? 'Speichern' : 'Save')}
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

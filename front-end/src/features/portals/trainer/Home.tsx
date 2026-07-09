import React, { useState, useEffect } from 'react';
import { translateText } from '../../../lib/translateName';
import {
  CalendarClock, BookOpen, Users, CheckCircle2,
  Clock, ChevronRight, ChevronDown, Layers, Play, X
} from 'lucide-react';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { Badge } from '../../../components/Badge';
import { Avatar } from '../../../components/Avatar';

export default function TrHome() {
  const { lang } = useApp();
  const de = lang === 'de';

  const [measures,     setMeasures]     = useState<any[]>([]);
  const [courses,      setCourses]      = useState<any[]>([]);
  const [sessions,     setSessions]     = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [openMeasure,  setOpenMeasure]  = useState<string | null>(null);
  const [openCourse,   setOpenCourse]   = useState<string | null>(null);

  // ===== Modal state =====
  const [modal, setModal] = useState<{ type: 'courses' | 'sessions' | 'participants'; data: any[] } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [m, c, s, p] = await Promise.all([
          api<any[]>('/measures').catch(() => []),
          api<any[]>('/courses').catch(() => []),
          api<any[]>('/sessions').catch(() => []),
          api<any[]>('/participants').catch(() => []),
        ]);
        setMeasures(Array.isArray(m) ? m : []);
        setCourses(Array.isArray(c) ? c : []);
        setSessions(Array.isArray(s) ? s : []);
        setParticipants(Array.isArray(p) ? p : []);
        if (Array.isArray(m) && m.length > 0) setOpenMeasure(m[0].id);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const coursesForMeasure  = (mId: string) => courses.filter((c) => c.measureId === mId);
  const sessionsForCourse  = (cId: string) => sessions.filter((s) => s.courseId === cId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const sessionsForMeasure = (mId: string) => coursesForMeasure(mId).flatMap((c) => sessionsForCourse(c.id));
  const partsForMeasure    = (mId: string) => participants.filter((p) => p.measureId === mId || p.measure?.id === mId);

  const totalCourses  = courses.length;
  const totalSessions = sessions.length;
  const totalParts    = participants.length;

  if (loading) {
    return <div className="card" style={{ padding: 30, color: C.muted, fontSize: 13 }}>...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ===== CLICKABLE STATS ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {/* Courses */}
        <div
          className="card"
          onClick={() => setModal({ type: 'courses', data: courses })}
          style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'box-shadow .15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 4px 20px ${C.iris}30`)}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
        >
          <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: C.iris, display: 'grid', placeItems: 'center' }}>
            <BookOpen size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.iris, lineHeight: 1 }}>{totalCourses}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{de ? 'Kurse' : 'Courses'}</div>
          </div>
          <ChevronRight size={14} color={C.muted} style={{ marginLeft: 'auto' }} />
        </div>

        {/* Sessions */}
        <div
          className="card"
          onClick={() => setModal({ type: 'sessions', data: sessions })}
          style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'box-shadow .15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 4px 20px ${C.amber}30`)}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
        >
          <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: C.amber, display: 'grid', placeItems: 'center' }}>
            <CalendarClock size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.amber, lineHeight: 1 }}>{totalSessions}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{de ? 'Sitzungen' : 'Sessions'}</div>
          </div>
          <ChevronRight size={14} color={C.muted} style={{ marginLeft: 'auto' }} />
        </div>

        {/* Participants */}
        <div
          className="card"
          onClick={() => setModal({ type: 'participants', data: participants })}
          style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'box-shadow .15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 4px 20px ${C.mint}30`)}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '')}
        >
          <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: C.mint, display: 'grid', placeItems: 'center' }}>
            <Users size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.mint, lineHeight: 1 }}>{totalParts}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{de ? 'Teilnehmer' : 'Participants'}</div>
          </div>
          <ChevronRight size={14} color={C.muted} style={{ marginLeft: 'auto' }} />
        </div>
      </div>

      {/* ===== MEASURES → COURSES → SESSIONS ===== */}
      {measures.length === 0 && (
        <div className="card" style={{ padding: 30, textAlign: 'center', color: C.muted, fontSize: 13 }}>
          {de ? 'Keine Bootcamps gefunden.' : 'No bootcamps found.'}
        </div>
      )}

      {measures.map((measure) => {
        const mCourses  = coursesForMeasure(measure.id);
        const mParts    = partsForMeasure(measure.id);
        const mSessions = sessionsForMeasure(measure.id);
        const isMOpen   = openMeasure === measure.id;

        return (
          <div key={measure.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>

            {/* Measure header */}
            <div
              onClick={() => setOpenMeasure(isMOpen ? null : measure.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                cursor: 'pointer', background: isMOpen ? C.iris + '08' : '#fff',
                borderBottom: isMOpen ? `1px solid ${C.line}` : 'none',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: isMOpen ? C.iris : C.soft, display: 'grid', placeItems: 'center' }}>
                <Layers size={19} color={isMOpen ? '#fff' : C.muted} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: isMOpen ? C.iris : '#334155' }}>
                  {translateText(measure.name, lang)}
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {/* Clickable mini stats per bootcamp */}
                  <span
                    onClick={(e) => { e.stopPropagation(); setModal({ type: 'courses', data: mCourses }); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: C.iris, fontWeight: 600 }}>
                    <BookOpen size={11} /> {mCourses.length} {de ? 'Kurse' : 'courses'}
                  </span>
                  <span
                    onClick={(e) => { e.stopPropagation(); setModal({ type: 'sessions', data: mSessions }); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: C.amber, fontWeight: 600 }}>
                    <CalendarClock size={11} /> {mSessions.length} {de ? 'Sitzungen' : 'sessions'}
                  </span>
                  <span
                    onClick={(e) => { e.stopPropagation(); setModal({ type: 'participants', data: mParts }); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: mParts.length > 0 ? C.mint : C.muted, fontWeight: 600 }}>
                    <Users size={11} /> {mParts.length} {de ? 'TN' : 'participants'}
                  </span>
                </div>
              </div>
              {isMOpen ? <ChevronDown size={15} color={C.iris} /> : <ChevronRight size={15} color={C.muted} />}
            </div>

            {/* Courses */}
            {isMOpen && (
              <div style={{ padding: '10px 12px 12px', background: C.iris + '04' }}>
                {mCourses.length === 0 && (
                  <div style={{ padding: '10px 6px', color: C.muted, fontSize: 13 }}>
                    {de ? 'Keine Kurse.' : 'No courses.'}
                  </div>
                )}

                {mCourses.map((course) => {
                  const cSessions = sessionsForCourse(course.id);
                  const isCOpen   = openCourse === course.id;
                  return (
                    <div key={course.id} style={{ marginBottom: 8 }}>

                      {/* Course row */}
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
                          <BookOpen size={14} color={isCOpen ? '#fff' : C.muted} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: isCOpen ? C.amber : '#334155' }}>
                            {course.name}
                          </div>
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2, display: 'flex', gap: 8 }}>
                            {/* Clickable per-course stats */}
                            <span
                              onClick={(e) => { e.stopPropagation(); setModal({ type: 'sessions', data: cSessions }); }}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 3, cursor: 'pointer', color: C.amber, fontWeight: 600 }}>
                              <CalendarClock size={10} /> {cSessions.length} {de ? 'Sitzungen' : 'sessions'}
                            </span>
                          </div>
                        </div>
                        {isCOpen ? <ChevronDown size={14} color={C.amber} /> : <ChevronRight size={14} color={C.muted} />}
                      </div>

                      {/* Sessions */}
                      {isCOpen && (
                        <div style={{ border: `1px solid ${C.amber}`, borderTop: 'none', borderRadius: '0 0 10px 10px', background: '#fff', overflow: 'hidden' }}>
                          {cSessions.length === 0 && (
                            <div style={{ padding: '12px 14px', color: C.muted, fontSize: 13 }}>
                              {de ? 'Keine Sitzungen.' : 'No sessions.'}
                            </div>
                          )}
                          {cSessions.map((session, i) => {
                            const isCaptured = session.status === 'captured';
                            const isOpen     = session.status === 'open' || session.status === 'openS';
                            return (
                              <div key={session.id} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                                borderBottom: i < cSessions.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
                              }}>
                                <div style={{
                                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                                  background: isCaptured ? C.mint + '18' : C.iris + '12',
                                  color: isCaptured ? C.mint : C.iris,
                                  display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700,
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
                                  </div>
                                </div>
                                {isCaptured ? (
                                  <span className="badge" style={{ background: C.mint + '18', color: C.mint, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                    <CheckCircle2 size={11} /> {de ? 'Erfasst' : 'Captured'}
                                  </span>
                                ) : isOpen ? (
                                  <span className="badge" style={{ background: C.amber + '18', color: C.amber, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                    <Clock size={11} /> {de ? 'Offen' : 'Open'}
                                  </span>
                                ) : (
                                  <span className="badge" style={{ background: C.line, color: C.muted, fontSize: 11 }}>
                                    {de ? 'Geplant' : 'Planned'}
                                  </span>
                                )}
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

      {/* ===== MODAL ===== */}
      {modal && (
        <div onClick={() => setModal(null)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 500, padding: 0, overflow: 'hidden', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>

            {/* Modal header */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                {modal.type === 'courses'      && <><BookOpen size={17} color={C.iris} /> {de ? 'Kurse' : 'Courses'} · {modal.data.length}</>}
                {modal.type === 'sessions'     && <><CalendarClock size={17} color={C.amber} /> {de ? 'Sitzungen' : 'Sessions'} · {modal.data.length}</>}
                {modal.type === 'participants' && <><Users size={17} color={C.mint} /> {de ? 'Teilnehmer' : 'Participants'} · {modal.data.length}</>}
              </div>
              <button onClick={() => setModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ overflowY: 'auto', padding: '12px 0' }}>
              {modal.data.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: C.muted, fontSize: 13 }}>
                  {de ? 'Keine Daten.' : 'No data.'}
                </div>
              )}

              {/* Courses list */}
              {modal.type === 'courses' && modal.data.map((c, i) => (
                <div key={c.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: `1px solid ${C.lineSoft}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: C.iris + '12', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: C.iris }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                      {sessions.filter((s) => s.courseId === c.id).length} {de ? 'Sitzungen' : 'sessions'}
                    </div>
                  </div>
                </div>
              ))}

              {/* Sessions list */}
              {modal.type === 'sessions' && modal.data.map((s, i) => (
                <div key={s.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: `1px solid ${C.lineSoft}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: C.amber + '12', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: C.amber }}>
                    {s.order ?? i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.title || `Session ${i + 1}`}</div>
                    <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2, display: 'flex', gap: 8 }}>
                      {s.time && <span>{s.time}</span>}
                      {s.room && <span>{s.room}</span>}
                    </div>
                  </div>
                  {s.status === 'captured' && <span className="badge" style={{ background: C.mint + '18', color: C.mint, fontSize: 11 }}>{de ? 'Erfasst' : 'Captured'}</span>}
                </div>
              ))}

              {/* Participants list */}
              {modal.type === 'participants' && modal.data.map((p, i) => (
                <div key={p.id ?? i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: `1px solid ${C.lineSoft}` }}>
                  <Avatar n={p.name} c={p.c} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>
                      {p.contact ?? p.email ?? ''}
                    </div>
                  </div>
                  <Badge s={p.status} />
                </div>
              ))}
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




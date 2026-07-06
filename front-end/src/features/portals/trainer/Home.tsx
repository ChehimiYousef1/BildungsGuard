import React, { useState, useEffect } from 'react';
import { translateText } from '../../../lib/translateName';
import {
  CalendarClock, BookOpen, Users, CheckCircle2,
  Clock, ChevronRight, ChevronDown, Layers, Play
} from 'lucide-react';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { Badge } from '../../../components/Badge';

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
  const partsForMeasure    = (mId: string) => participants.filter((p) => p.measureId === mId || p.measure?.id === mId);

  const totalCourses  = courses.length;
  const totalSessions = sessions.length;
  const totalParts    = participants.length;

  if (loading) {
    return <div className="card" style={{ padding: 30, color: C.muted, fontSize: 13 }}>...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ===== STATS ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { icon: <BookOpen size={20} color="#fff" />,       val: totalCourses,  label: de ? 'Kurse'      : 'Courses',      col: C.iris  },
          { icon: <CalendarClock size={20} color="#fff" />,  val: totalSessions, label: de ? 'Sitzungen'  : 'Sessions',     col: C.amber },
          { icon: <Users size={20} color="#fff" />,          val: totalParts,    label: de ? 'Teilnehmer' : 'Participants', col: C.mint  },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: stat.col, display: 'grid', placeItems: 'center',
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: stat.col, lineHeight: 1 }}>
                {stat.val}
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{stat.label}</div>
            </div>
          </div>
        ))}
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
        const mSessions = mCourses.reduce((sum, c) => sum + sessionsForCourse(c.id).length, 0);
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
                  {translateText(translateText(measure.name, lang), lang)}
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <BookOpen size={11} /> {mCourses.length} {de ? 'Kurse' : 'courses'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <CalendarClock size={11} /> {mSessions} {de ? 'Sitzungen' : 'sessions'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: mParts.length > 0 ? C.iris : C.muted }}>
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
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                            <CalendarClock size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                            {cSessions.length} {de ? 'Sitzungen' : 'sessions'}
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
                            const attPct     = session.participantCount > 0
                              ? Math.round((session.present / session.participantCount) * 100)
                              : null;

                            return (
                              <div key={session.id} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                                borderBottom: i < cSessions.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
                              }}>
                                <div style={{
                                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                                  background: isCaptured ? C.mint + '18' : C.iris + '12',
                                  display: 'grid', placeItems: 'center',
                                  fontSize: 11, fontWeight: 700,
                                  color: isCaptured ? C.mint : C.iris,
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

                                {isCaptured && attPct !== null && (
                                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: attPct >= 80 ? C.mint : C.amber }}>
                                      {session.present}/{session.participantCount}
                                    </div>
                                    <div style={{ fontSize: 10, color: C.muted }}>{attPct}%</div>
                                  </div>
                                )}

                                {isCaptured ? (
                                  <span className="badge" style={{ background: C.mint + '18', color: C.mint, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                    <CheckCircle2 size={10} /> {de ? 'Erfasst' : 'Captured'}
                                  </span>
                                ) : isOpen ? (
                                  <span className="badge" style={{ background: C.amber + '18', color: C.amber, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                    <Clock size={10} /> {de ? 'Offen' : 'Open'}
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
    </div>
  );
}




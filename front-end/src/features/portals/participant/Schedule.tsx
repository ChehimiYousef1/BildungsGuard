import React, { useState, useEffect } from 'react';
import {
  Clock, MapPin, Video, CalendarClock,
  BookOpen, ChevronRight, ChevronDown
} from 'lucide-react';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { useMe } from './useMe';

export default function PaHome() {
  const { lang } = useApp();
  const de = lang === 'de';
  const { me, loading: meLoading } = useMe();

  const [courses,  setCourses]  = useState<any[]>([]);
  const [sessions, setSessions] = useState<Record<string, any[]>>({});
  const [loading,  setLoading]  = useState(true);
  const [openCourse, setOpenCourse] = useState<string | null>(null);

  useEffect(() => {
    if (meLoading || !me) { setLoading(false); return; }
    (async () => {
      try {
        const measureId = me.measureId ?? me.measure?.id;

        const allCourses = await api<any[]>('/courses').catch(() => []);
        const myCourses  = (Array.isArray(allCourses) ? allCourses : []).filter(
          (c: any) => !measureId || c.measureId === measureId
        );
        setCourses(myCourses);

        const allSessions = await api<any[]>('/sessions').catch(() => []);
        const sessMap: Record<string, any[]> = {};
        myCourses.forEach((c: any) => {
          sessMap[c.id] = (Array.isArray(allSessions) ? allSessions : [])
            .filter((s: any) => s.courseId === c.id)
            .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
        });
        setSessions(sessMap);

        if (myCourses.length > 0) setOpenCourse(myCourses[0].id);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [me, meLoading]);

  const totalSessions = Object.values(sessions).reduce((s, arr) => s + arr.length, 0);

  if (meLoading || loading) {
    return <div className="card" style={{ padding: 30, color: C.muted, fontSize: 13 }}>...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Header */}
      <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 10, background: C.iris, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <CalendarClock size={20} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.iris }}>
            {de ? 'Mein Stundenplan' : 'My Schedule'}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            {courses.length} {de ? 'Kurse' : 'courses'} · {totalSessions} {de ? 'Sitzungen' : 'sessions'}
          </div>
        </div>
      </div>

      {courses.length === 0 && (
        <div className="card" style={{ padding: 30, textAlign: 'center', color: C.muted, fontSize: 13 }}>
          <CalendarClock size={32} color={C.mutedLight} style={{ margin: '0 auto 12px', display: 'block' }} />
          {de ? 'Keine Kurse gefunden.' : 'No courses found.'}
        </div>
      )}

      {/* Courses */}
      {courses.map((course) => {
        const cSessions = sessions[course.id] ?? [];
        const isOpen    = openCourse === course.id;

        return (
          <div key={course.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>

            {/* Course row — click to expand */}
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
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: isOpen ? C.iris : C.soft,
                display: 'grid', placeItems: 'center',
              }}>
                <BookOpen size={18} color={isOpen ? '#fff' : C.muted} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: isOpen ? C.iris : '#334155' }}>
                  {course.name}
                </div>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <CalendarClock size={11} /> {cSessions.length} {de ? 'Sitzungen' : 'sessions'}
                  </span>
                  {course.meetingUrl && (
                    <span style={{ color: C.rose, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Video size={11} /> Live
                    </span>
                  )}
                </div>
              </div>
              {isOpen
                ? <ChevronDown size={15} color={C.iris} />
                : <ChevronRight size={15} color={C.muted} />}
            </div>

            {/* Sessions inside course */}
            {isOpen && (
              <div>
                {cSessions.length === 0 && (
                  <div style={{ padding: '14px 16px', color: C.muted, fontSize: 13 }}>
                    {de ? 'Noch keine Sitzungen.' : 'No sessions yet.'}
                  </div>
                )}
                {cSessions.map((session, i) => (
                  <div key={session.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
                    borderBottom: i < cSessions.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
                    background: '#fafafa',
                  }}>
                    {/* Number */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                      background: C.iris + '12', display: 'grid', placeItems: 'center',
                      fontSize: 11, fontWeight: 700, color: C.iris,
                    }}>
                      {session.order ?? i + 1}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {session.title || `${de ? 'Sitzung' : 'Session'} ${session.order ?? i + 1}`}
                      </div>
                      <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {session.time && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <Clock size={10} /> {session.time}
                          </span>
                        )}
                        {session.room && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <MapPin size={10} /> {session.room}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Live button */}
                    {session.meetingUrl && (
                      <button
                        onClick={() => window.open(session.meetingUrl, '_blank', 'noopener')}
                        className="btn btn-ghost"
                        style={{ padding: '5px 10px', fontSize: 11, color: C.rose, display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
                      >
                        <Video size={12} /> Live
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer note */}
      <div className="card" style={{ display: 'flex', gap: 11, alignItems: 'center', background: C.soft, fontSize: 12.5, color: C.inkSoft }}>
        <CalendarClock size={17} color={C.iris} style={{ flexShrink: 0 }} />
        {de
          ? 'Live-Links öffnen Teams/Zoom für den Online-Unterricht.'
          : 'Live links open Teams/Zoom for online classes.'}
      </div>
    </div>
  );
}
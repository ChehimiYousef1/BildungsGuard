import React, { useState, useEffect } from 'react';
import {
  Play, CheckCircle2, ChevronRight,
  BookOpen, Lock, CalendarClock, Layers
} from 'lucide-react';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { translateText } from '../../../lib/translateName';
import { useMe } from './useMe';

export default function PaLearn() {
  const { lang } = useApp();
  const de = lang === 'de';
  const { me, loading: meLoading } = useMe();

  const [measure,       setMeasure]       = useState<any>(null);
  const [courses,       setCourses]       = useState<any[]>([]);
  const [sessions,      setSessions]      = useState<Record<string, any[]>>({});
  const [done,          setDone]          = useState<Record<string, boolean>>({});
  const [activeCourse,  setActiveCourse]  = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [marking,       setMarking]       = useState(false);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (meLoading || !me) { setLoading(false); return; }
    (async () => {
      try {
        const measureId = me.measureId ?? me.measure?.id;
        console.log('[Learn] me:', me.name, '| measureId:', measureId);

        if (measureId) {
          const m = await api(`/measures/${measureId}`).catch(() => null);
          setMeasure(m);
        }

        const allCourses = await api('/courses').catch(() => []);
        const myCourses  = (Array.isArray(allCourses) ? allCourses : []).filter(
          (c) => c.measureId === (me.measureId ?? me.measure?.id)
        );
        console.log('[Learn] courses found:', myCourses.length);
        setCourses(myCourses);
        if (myCourses.length > 0) setActiveCourse(myCourses[0].id);

        const allSessions = await api('/sessions').catch(() => []);
        const sessMap = {};
        myCourses.forEach((c) => {
          sessMap[c.id] = (Array.isArray(allSessions) ? allSessions : [])
            .filter((s) => s.courseId === c.id)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        });
        setSessions(sessMap);

        const progress = await api(`/lesson-progress?participantId=${me.id}`).catch(() => []);
        const pMap = {};
        (Array.isArray(progress) ? progress : []).forEach((p) => {
          if (p.sessionId) pMap[p.sessionId] = !!p.completed;
        });
        setDone(pMap);

      } catch (e) { console.error('[Learn] load failed', e); }
      finally { setLoading(false); }
    })();
  }, [me, meLoading]);

  const markDone = async (sessionId) => {
    if (!me?.id || marking) return;
    setMarking(true);
    try {
      await api('/lesson-progress', {
        method: 'POST',
        body: JSON.stringify({ participantId: me.id, sessionId, completed: true }),
      });
      setDone((d) => ({ ...d, [sessionId]: true }));
    } catch (e) { console.error('mark done failed', e); }
    finally { setMarking(false); }
  };

  const allSess   = Object.values(sessions).flat();
  const totalSess = allSess.length;
  const doneSess  = allSess.filter((s) => done[s.id]).length;
  const pct       = totalSess > 0 ? Math.round((doneSess / totalSess) * 100) : 0;
  const activeSessions = activeCourse ? (sessions[activeCourse] ?? []) : [];
  const tCourseName  = (c: any) => translateText(c?.name  ?? '', lang);
  const tMeasureName = (m: any) => translateText(m?.name  ?? '', lang);

  if (meLoading || loading) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 14 }}>
        ...
      </div>
    );
  }

  if (!me) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <BookOpen size={36} color={C.mutedLight} style={{ margin: '0 auto 14px', display: 'block' }} />
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
          {de ? 'Kein Teilnehmer-Profil gefunden' : 'No participant profile found'}
        </div>
        <div style={{ color: C.muted, fontSize: 13 }}>
          {de ? 'Bitte wende dich an die Verwaltung.' : 'Please contact the administration.'}
        </div>
      </div>
    );
  }

  if (!me.measureId && !me.measure?.id) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <Layers size={36} color={C.mutedLight} style={{ margin: '0 auto 14px', display: 'block' }} />
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
          {de ? 'Kein Bootcamp zugewiesen' : 'No bootcamp assigned'}
        </div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>
          {de ? 'Bitte wende dich an die Verwaltung.' : 'Please contact the administration.'}
        </div>
        <div style={{ fontSize: 11, color: C.muted, padding: '8px 12px', borderRadius: 8, background: C.soft, display: 'inline-block' }}>
          {de ? 'Angemeldet als:' : 'Logged in as:'} {me.name} &middot; ID: {me.id}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <CalendarClock size={36} color={C.mutedLight} style={{ margin: '0 auto 14px', display: 'block' }} />
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
          {de ? 'Noch keine Kurse verfugbar' : 'No courses available yet'}
        </div>
        <div style={{ color: C.muted, fontSize: 13 }}>
          {de ? 'Deine Kurse werden bald freigeschaltet.' : 'Your courses will be unlocked soon.'}
        </div>
        <div style={{ fontSize: 11, color: C.muted, padding: '8px 12px', borderRadius: 8, background: C.soft, display: 'inline-block', marginTop: 12 }}>
          Bootcamp ID: {me.measureId ?? me.measure?.id}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: C.iris, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Layers size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
              {de ? 'Dein Bootcamp' : 'Your Bootcamp'}
            </div>
            <div style={{ fontWeight: 800, fontSize: 17, color: C.iris }}>
              {tMeasureName(measure) || 'Bootcamp'}
            </div>
            {measure?.number && (
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Nr. {measure.number}</div>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: pct === 100 ? C.mint : C.iris }}>
              {pct}%
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{doneSess}/{totalSess} {de ? 'erledigt' : 'done'}</div>
            <div style={{ width: 100, height: 4, borderRadius: 2, background: C.line, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ height: 4, width: `${pct}%`, background: pct === 100 ? C.mint : C.iris, borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14, alignItems: 'start' }}>

        <div className="card" style={{ padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, padding: '4px 8px 10px' }}>
            {de ? 'Kurse' : 'Courses'} &middot; {courses.length}
          </div>
          {courses.map((course) => {
            const csess      = sessions[course.id] ?? [];
            const cdone      = csess.filter((s) => done[s.id]).length;
            const isActive   = activeCourse === course.id;
            const isComplete = csess.length > 0 && cdone === csess.length;
            return (
              <div
                key={course.id}
                onClick={() => { setActiveCourse(course.id); setActiveSession(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '9px 10px', borderRadius: 9, cursor: 'pointer',
                  background: isActive ? C.iris + '10' : 'transparent',
                  border: `1.5px solid ${isActive ? C.iris : 'transparent'}`,
                  marginBottom: 4,
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: isComplete ? C.mint + '18' : isActive ? C.iris + '18' : C.soft,
                  display: 'grid', placeItems: 'center',
                }}>
                  {isComplete
                    ? <CheckCircle2 size={14} color={C.mint} />
                    : <BookOpen size={14} color={isActive ? C.iris : C.muted} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: isActive ? C.iris : '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tCourseName(course)}
                  </div>
                  <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1 }}>
                    {cdone}/{csess.length} {de ? 'erledigt' : 'done'}
                  </div>
                </div>
                {isActive && <ChevronRight size={13} color={C.iris} />}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

          {activeCourse && (() => {
            const course = courses.find((c) => c.id === activeCourse);
            if (!course) return null;
            return (
              <div style={{ padding: '6px 2px 2px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarClock size={14} color={C.amber} />
                <span style={{ fontWeight: 700, fontSize: 13.5, color: '#334155' }}>{tCourseName(course)}</span>
                <span style={{ fontSize: 11.5, color: C.muted }}>
                  &middot; {activeSessions.length} {de ? 'Sitzungen' : 'sessions'}
                </span>
              </div>
            );
          })()}

          {activeSessions.length === 0 && (
            <div className="card" style={{ padding: 30, textAlign: 'center', color: C.muted, fontSize: 13 }}>
              {de ? 'Noch keine Sitzungen in diesem Kurs.' : 'No sessions in this course yet.'}
            </div>
          )}

          {activeSessions.map((session, i) => {
            const isDone   = done[session.id];
            const isActive = activeSession?.id === session.id;
            const isLocked = i > 0 && !done[activeSessions[i - 1]?.id] && !isDone;

            return (
              <div
                key={session.id}
                className="card"
                style={{
                  padding: '14px 16px',
                  border: `1.5px solid ${isActive ? C.iris : isDone ? C.mint + '40' : C.line}`,
                  background: isDone ? C.mint + '05' : isActive ? C.iris + '05' : '#fff',
                  cursor: isLocked ? 'default' : 'pointer',
                  opacity: isLocked ? 0.55 : 1,
                }}
                onClick={() => { if (!isLocked) setActiveSession(isActive ? null : session); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: isDone ? C.mint + '18' : isLocked ? C.line : C.iris + '12',
                    display: 'grid', placeItems: 'center',
                    fontSize: 12, fontWeight: 800,
                    color: isDone ? C.mint : isLocked ? C.muted : C.iris,
                  }}>
                    {isDone
                      ? <CheckCircle2 size={16} color={C.mint} />
                      : isLocked
                        ? <Lock size={14} color={C.muted} />
                        : (session.order ?? i + 1)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: isLocked ? C.muted : '#1e293b' }}>
                      {session.title || `${de ? 'Sitzung' : 'Session'} ${session.order ?? i + 1}`}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {session.time && <span>{session.time}</span>}
                      {session.room && <span>{session.room}</span>}
                    </div>
                  </div>

                  {isDone ? (
                    <span className="badge" style={{ background: C.mint + '18', color: C.mint, fontSize: 11 }}>
                      {de ? 'Erledigt' : 'Done'}
                    </span>
                  ) : !isLocked ? (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
                      disabled={marking}
                      onClick={(e) => { e.stopPropagation(); markDone(session.id); }}
                    >
                      <Play size={11} /> {de ? 'Als erledigt' : 'Mark done'}
                    </button>
                  ) : (
                    <div style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={11} />
                      {de ? 'Gesperrt' : 'Locked'}
                    </div>
                  )}
                </div>

                {/* Video — always visible, no lock required */}
                {session.videoRef && (
                  <div style={{ marginTop: 12, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.line}` }}>
                    <video
                      src={session.videoRef}
                      controls
                      style={{ width: '100%', maxHeight: 320, background: '#000', display: 'block' }}
                    />
                  </div>
                )}

                {isActive && session.meetingUrl && (
                  <div style={{ marginTop: 12 }}>
                    <button
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13 }}
                      onClick={() => window.open(session.meetingUrl, '_blank', 'noopener')}
                    >
                      <Play size={13} /> {de ? 'Meeting beitreten' : 'Join meeting'}
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Play, CheckCircle2, ChevronRight,
  BookOpen, Lock, CalendarClock, Layers,
  ListChecks, Clock, Trophy, Sparkles
} from 'lucide-react';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import QuizPlayer from './QuizPlayer';
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
  const [quizzes,    setQuizzes]    = useState<any[]>([]);
  const [activeQuiz,  setActiveQuiz]  = useState<any>(null);
  const [doneQuizIds, setDoneQuizIds]  = useState<Set<string>>(new Set());

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

        // Load quizzes
        const mId = me.measureId ?? me.measure?.id;
        const qUrl = '/quiz';
        api(qUrl).then(async (q: any) => {
          console.log('[Learn] quizzes:', q);
          const list = Array.isArray(q) ? q : [];
          setQuizzes(list);
          // Check which quizzes participant already attempted
          if (me?.id && list.length > 0) {
            const doneIds = new Set<string>();
            await Promise.all(list.map(async (quiz: any) => {
              try {
                const attempts = await api('/quiz/' + quiz.id + '/attempts').catch(() => []);
                const arr = Array.isArray(attempts) ? attempts : [];
                // me.id is the participant ID - check against attempts
                // Get JWT userId as fallback
                let jwtUserId = '';
                try {
                  const tok = localStorage.getItem('aio_token');
                  if (tok) jwtUserId = JSON.parse(atob(tok.split('.')[1])).userId ?? '';
                } catch {}
                const hasAttempt = arr.some((a: any) =>
                  a.participantId === me.id || a.participantId === jwtUserId
                );
                console.log('[Quiz Lock] quiz:', quiz.id, '| me.id:', me.id, '| jwtUserId:', jwtUserId, '| hasAttempt:', hasAttempt);
                if (hasAttempt) {
                  doneIds.add(quiz.id);
                }
              } catch {}
            }));
            setDoneQuizIds(doneIds);
          }
        }).catch(() => {});
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

  /* Shared style block: Premium UI styles, transitions, and fully responsive Grid */
  const StyleSheet = () => (
    <style>{`
      @keyframes lmsFadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulseBorder {
        0% { box-shadow: 0 0 0 0 rgba(109, 93, 246, 0.4); }
        70% { box-shadow: 0 0 0 6px rgba(109, 93, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(109, 93, 246, 0); }
      }
      .lms-fade { animation: lmsFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .lms-grid {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 20px;
        align-items: start;
      }
      @media (max-width: 900px) {
        .lms-grid { grid-template-columns: 1fr; }
      }
      .lms-course-item {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      }
      .lms-course-item:hover {
        background: rgba(109, 93, 246, 0.04) !important;
        transform: translateX(4px);
      }
      .lms-course-item.active {
        box-shadow: 0 4px 12px -2px rgba(109, 93, 246, 0.08);
      }
      .lms-course-item.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 20%;
        height: 60%;
        width: 3.5px;
        background: #6D5DF6;
        border-radius: 0 4px 4px 0;
      }
      .lms-session-card {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .lms-session-card:not(.locked):hover {
        box-shadow: 0 10px 25px -8px rgba(15, 23, 42, 0.08), 0 4px 12px -4px rgba(15, 23, 42, 0.03);
        transform: translateY(-2px);
        border-color: #6D5DF640 !important;
      }
      .lms-video-container {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
      }
      .lms-video-container:hover {
        transform: scale(1.005);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
      }
      .lms-quiz-card {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .lms-quiz-card:hover {
        box-shadow: 0 12px 30px -10px rgba(109, 93, 246, 0.18);
        transform: translateY(-2px);
        border-color: #6D5DF660 !important;
      }
      .lms-btn-primary {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 600;
        letter-spacing: -0.1px;
      }
      .lms-btn-primary:not(:disabled):hover {
        filter: brightness(1.05);
        box-shadow: 0 4px 12px rgba(109, 93, 246, 0.25);
      }
      .lms-btn-primary:not(:disabled):active {
        transform: scale(0.96);
      }
    `}</style>
  );

  if (meLoading || loading) {
    return (
      <>
        <StyleSheet />
        <div className="card lms-fade" style={{ padding: '80px 40px', textAlign: 'center', color: C.muted, borderRadius: 16, border: `1px solid ${C.line}` }}>
          <div style={{
            width: 40, height: 40, margin: '0 auto 20px', borderRadius: '50%',
            border: `3px solid ${C.line}`, borderTopColor: '#6D5DF6',
            animation: 'spin 1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontSize: 14, fontWeight: 500, letterSpacing: -0.2, color: '#64748b' }}>
            {de ? 'Inhalte werden geladen…' : 'Loading high-quality content…'}
          </span>
        </div>
      </>
    );
  }

  if (!me) {
    return (
      <>
        <StyleSheet />
        <div className="card lms-fade" style={{ padding: 64, textAlign: 'center', borderRadius: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(109, 93, 246, 0.06)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
            <BookOpen size={32} color="#6D5DF6" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 8, color: '#0f172a', letterSpacing: -0.3 }}>
            {de ? 'Kein Teilnehmer-Profil gefunden' : 'No participant profile found'}
          </div>
          <div style={{ color: C.muted, fontSize: 14, maxWidth: 400, margin: '0 auto', lineHeight: 1.5 }}>
            {de ? 'Bitte wende dich an die Verwaltung.' : 'Please contact the administration to set up your profile.'}
          </div>
        </div>
      </>
    );
  }

  if (!me.measureId && !me.measure?.id) {
    return (
      <>
        <StyleSheet />
        <div className="card lms-fade" style={{ padding: 64, textAlign: 'center', borderRadius: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.08)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
            <Layers size={32} color="#f59e0b" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 8, color: '#0f172a', letterSpacing: -0.3 }}>
            {de ? 'Kein Bootcamp zugewiesen' : 'No bootcamp assigned'}
          </div>
          <div style={{ color: C.muted, fontSize: 14, marginBottom: 20, maxWidth: 400, margin: '0 auto 20px', lineHeight: 1.5 }}>
            {de ? 'Bitte wende dich an die Verwaltung.' : 'Your account is active, but you are not linked to an active bootcamp cohort.'}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', padding: '10px 18px', borderRadius: 12, background: '#f1f5f9', display: 'inline-block', fontWeight: 500 }}>
            {de ? 'Angemeldet als:' : 'Logged in as:'} <strong style={{ color: '#0f172a' }}>{me.name}</strong> &middot; ID: {me.id}
          </div>
        </div>
      </>
    );
  }

  if (courses.length === 0) {
    return (
      <>
        <StyleSheet />
        <div className="card lms-fade" style={{ padding: 64, textAlign: 'center', borderRadius: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(109, 93, 246, 0.06)', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
            <CalendarClock size={32} color="#6D5DF6" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 8, color: '#0f172a', letterSpacing: -0.3 }}>
            {de ? 'Noch keine Kurse verfugbar' : 'No courses available yet'}
          </div>
          <div style={{ color: C.muted, fontSize: 14, maxWidth: 400, margin: '0 auto', lineHeight: 1.5 }}>
            {de ? 'Deine Kurse werden bald freigeschaltet.' : 'We are preparing your modules. Your assigned courses will be unlocked shortly.'}
          </div>
          <div style={{ fontSize: 12, color: C.muted, padding: '10px 18px', borderRadius: 12, background: '#f8fafc', display: 'inline-block', marginTop: 20, border: '1px dashed #e2e8f0', fontWeight: 500 }}>
            Bootcamp ID: {me.measureId ?? me.measure?.id}
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <StyleSheet />

      {/* ===== HERO / PROGRESS ===== */}
      <div className="card lms-fade" style={{ 
        padding: '24px 28px', 
        borderRadius: 16, 
        border: '1px solid #e2e8f0',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1, minWidth: 260 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(135deg, #6D5DF6 0%, #8B7CF6 100%)',
              display: 'grid', placeItems: 'center',
              boxShadow: '0 8px 20px -4px rgba(109, 93, 246, 0.45)',
            }}>
              <Layers size={26} color="#fff" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6D5DF6', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>
                {de ? 'Dein Bootcamp' : 'Your Bootcamp'}
              </div>
              <div style={{ fontWeight: 850, fontSize: 21, color: '#0f172a', letterSpacing: -0.4, lineHeight: 1.2 }}>
                {tMeasureName(measure) || 'Bootcamp'}
              </div>
              {measure?.number && (
                <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
                  Batch Code: <strong style={{ color: '#334155' }}>{measure.number}</strong>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, padding: '4px 12px', borderRadius: 14, background: '#fff', border: '1px solid #f1f5f9' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: '#0f172a' }}>
                {doneSess} <span style={{ color: '#94a3b8', fontWeight: 400 }}>/</span> {totalSess}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                {de ? 'Sitzungen erledigt' : 'Sessions completed'}
              </div>
            </div>

            <div style={{
              width: 58, height: 58, borderRadius: '50%', flexShrink: 0,
              background: `conic-gradient(${pct === 100 ? '#10b981' : '#6D5DF6'} ${pct * 3.6}deg, #f1f5f9 0deg)`,
              display: 'grid', placeItems: 'center',
              transition: 'background 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%', background: '#fff',
                display: 'grid', placeItems: 'center',
              }}>
                <span style={{ fontWeight: 900, fontSize: 14, color: pct === 100 ? '#10b981' : '#6D5DF6', letterSpacing: -0.5 }}>
                  {pct}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lms-grid">

        {/* ===== COURSE LIST ===== */}
        <div className="card lms-fade" style={{ padding: 12, borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.1, padding: '6px 10px 12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{de ? 'Kurse' : 'Courses'}</span>
            <span style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 6, color: '#334155' }}>{courses.length}</span>
          </div>
          {courses.map((course) => {
            const csess      = sessions[course.id] ?? [];
            const cdone      = csess.filter((s) => done[s.id]).length;
            const isActive   = activeCourse === course.id;
            const isComplete = csess.length > 0 && cdone === csess.length;
            return (
              <div
                key={course.id}
                className={`lms-course-item ${isActive ? 'active' : ''}`}
                onClick={() => { setActiveCourse(course.id); setActiveSession(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 12px', borderRadius: 11, cursor: 'pointer',
                  background: isActive ? 'rgba(109, 93, 246, 0.05)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(109, 93, 246, 0.08)' : 'transparent'}`,
                  marginBottom: 6,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: isComplete ? 'rgba(16, 185, 129, 0.1)' : isActive ? 'rgba(109, 93, 246, 0.12)' : '#f1f5f9',
                  display: 'grid', placeItems: 'center',
                }}>
                  {isComplete
                    ? <CheckCircle2 size={15} color="#10b981" />
                    : <BookOpen size={15} color={isActive ? '#6D5DF6' : '#64748b'} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 600, color: isActive ? '#6D5DF6' : '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tCourseName(course)}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>
                    {cdone}/{csess.length} {de ? 'erledigt' : 'done'}
                  </div>
                </div>
                {isActive && <ChevronRight size={14} color="#6D5DF6" style={{ marginLeft: 'auto' }} />}
              </div>
            );
          })}
        </div>

        {/* ===== SESSIONS ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {activeCourse && (() => {
            const course = courses.find((c) => c.id === activeCourse);
            if (!course) return null;
            return (
              <div style={{ padding: '2px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarClock size={16} color="#f59e0b" />
                <span style={{ fontWeight: 800, fontSize: 14.5, color: '#1e293b', letterSpacing: -0.2 }}>{tCourseName(course)}</span>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                  &middot; {activeSessions.length} {de ? 'Sitzungen' : 'sessions'}
                </span>
              </div>
            );
          })()}

          {activeSessions.length === 0 && (
            <div className="card" style={{ padding: 48, textAlign: 'center', color: '#64748b', fontSize: 13.5, borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
              {de ? 'Noch keine Sitzungen in diesem Kurs.' : 'No sessions inside this course library yet.'}
            </div>
          )}

          {activeSessions.map((session, i) => {
            const isDone   = done[session.id];
            const isActive = activeSession?.id === session.id;
            const isLocked = i > 0 && !done[activeSessions[i - 1]?.id] && !isDone;

            return (
              <div
                key={session.id}
                className={`card lms-session-card${isLocked ? ' locked' : ''}`}
                style={{
                  padding: '16px 20px',
                  borderRadius: 16,
                  border: `1px solid ${isActive ? '#6D5DF6' : isDone ? 'rgba(16, 185, 129, 0.25)' : '#e2e8f0'}`,
                  background: isDone ? 'linear-gradient(135deg, #ffffff 0%, rgba(16, 185, 129, 0.02) 100%)' : isActive ? 'linear-gradient(135deg, #ffffff 0%, rgba(109, 93, 246, 0.02) 100%)' : '#fff',
                  cursor: isLocked ? 'default' : 'pointer',
                  opacity: isLocked ? 0.6 : 1,
                }}
                onClick={() => { if (!isLocked) setActiveSession(isActive ? null : session); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 200 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                      background: isDone ? 'rgba(16, 185, 129, 0.12)' : isLocked ? '#f1f5f9' : 'rgba(109, 93, 246, 0.1)',
                      display: 'grid', placeItems: 'center',
                      fontSize: 13, fontWeight: 800,
                      color: isDone ? '#10b981' : isLocked ? '#94a3b8' : '#6D5DF6',
                    }}>
                      {isDone
                        ? <CheckCircle2 size={18} color="#10b981" />
                        : isLocked
                          ? <Lock size={15} color="#94a3b8" />
                          : (session.order ?? i + 1)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 750, fontSize: 15, color: isLocked ? '#64748b' : '#0f172a', letterSpacing: -0.2 }}>
                        {session.title || `${de ? 'Sitzung' : 'Session'} ${session.order ?? i + 1}`}
                      </div>
                      <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap', fontWeight: 500 }}>
                        {session.time && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {session.time}</span>}
                        {session.room && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Layers size={12} /> {session.room}</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    {isDone ? (
                      <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
                        {de ? 'Erledigt' : 'Done'}
                      </span>
                    ) : !isLocked ? (
                      <button
                        className="btn btn-primary lms-btn-primary"
                        style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10, background: '#6D5DF6', border: 'none', color: '#fff' }}
                        disabled={marking}
                        onClick={(e) => { e.stopPropagation(); markDone(session.id); }}
                      >
                        <Play size={12} fill="#fff" /> {de ? 'Als erledigt' : 'Mark done'}
                      </button>
                    ) : (
                      <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, padding: '4px 8px' }}>
                        <Lock size={12} />
                        {de ? 'Gesperrt' : 'Locked'}
                      </div>
                    )}
                  </div>
                </div>

                {/* ===== CENTERED VIDEO WITH CINEMATIC THEATER FRAME ===== */}
                {session.videoRef && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    marginTop: 18, 
                    width: '100%' 
                  }}>
                    <div 
                      className="lms-video-container"
                      style={{ 
                        width: '100%',
                        maxWidth: '720px', 
                        borderRadius: 14, 
                        overflow: 'hidden', 
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
                        boxShadow: '0 10px 30px -5px rgba(0,0,0,0.12), 0 4px 12px -2px rgba(0,0,0,0.06)'
                      }}
                    >
                      <video
                        src={session.videoRef}
                        controls
                        style={{ width: '100%', maxHeight: '400px', display: 'block' }}
                      />
                    </div>
                  </div>
                )}

                {isActive && session.meetingUrl && (
                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', animation: 'pulseBorder 2s infinite', borderRadius: 10 }}>
                    <button
                      className="btn btn-primary lms-btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13, borderRadius: 10, background: '#10b981', border: 'none', color: '#fff' }}
                      onClick={() => window.open(session.meetingUrl, '_blank', 'noopener')}
                    >
                      <Play size={14} fill="#fff" /> {de ? 'Meeting beitreten' : 'Join Live Class'}
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* ===== QUIZ SECTION ===== */}
      {quizzes.length > 0 && (
        <div className="card lms-fade" style={{ marginTop: 8, borderRadius: 16, border: '1px solid #e2e8f0', background: '#fff' }}>
          <div className="card-head" style={{ padding: '20px 20px 14px', borderBottom: '1px solid #f1f5f9' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                background: 'rgba(109, 93, 246, 0.1)', display: 'grid', placeItems: 'center',
              }}>
                <Sparkles size={16} color="#6D5DF6" />
              </div>
              {de ? 'Quiz & Tests' : 'Quizzes & Challenges'}
              <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, background: 'rgba(109, 93, 246, 0.1)', color: '#6D5DF6', borderRadius: 20, padding: '2px 8px' }}>
                {quizzes.length}
              </span>
            </div>
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quizzes.map((q: any) => {
              const isDoneQuiz = doneQuizIds.has(q.id);
              return (
                <div
                  key={q.id}
                  className="lms-quiz-card"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', borderRadius: 14,
                    background: isDoneQuiz ? 'rgba(16, 185, 129, 0.03)' : '#f8fafc',
                    border: `1px solid ${isDoneQuiz ? 'rgba(16, 185, 129, 0.2)' : '#f1f5f9'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                      background: isDoneQuiz ? 'rgba(16, 185, 129, 0.12)' : 'rgba(109, 93, 246, 0.08)',
                      display: 'grid', placeItems: 'center',
                    }}>
                      {isDoneQuiz
                        ? <Trophy size={18} color="#10b981" />
                        : <ListChecks size={18} color="#6D5DF6" />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 750, fontSize: 14.5, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontWeight: 500 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ListChecks size={12} /> {q.questions?.length ?? 0} {de ? 'Fragen' : 'Questions'}
                        </span>
                        {q.timeLimit && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} /> {q.timeLimit} {de ? 'Min.' : 'Mins'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary lms-btn-primary"
                    style={{ 
                      padding: '8px 20px', 
                      fontSize: 12.5, 
                      flexShrink: 0, 
                      borderRadius: 10,
                      background: isDoneQuiz ? 'rgba(16, 185, 129, 0.1)' : '#6D5DF6',
                      color: isDoneQuiz ? '#10b981' : '#fff',
                      border: 'none',
                      fontWeight: 700
                    }}
                    disabled={isDoneQuiz}
                    onClick={() => !isDoneQuiz && setActiveQuiz(q)}
                  >
                    {isDoneQuiz
                      ? (de ? 'Erledigt' : 'Completed')
                      : (de ? 'Starten' : 'Start')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeQuiz && (
        <QuizPlayer key={activeQuiz?.id} quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={(_r: any) => { setDoneQuizIds(s => new Set([...s, activeQuiz?.id])); }} />
      )}
    </div>
  );
}
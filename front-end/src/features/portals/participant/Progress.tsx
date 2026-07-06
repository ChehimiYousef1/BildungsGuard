import React, { useState, useEffect } from 'react';
import { translateText } from '../../../lib/translateName';
import { Award, TrendingUp, BookOpen, CheckCircle2, XCircle, ClipboardList } from 'lucide-react';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { Bar2 } from '../../../components/Bar';
import { api } from '../../../lib/api';
import { useMe } from './useMe';

const PASS_MARK = 50;
const STORAGE_KEY = 'trainer_assignments';

interface Assignment { id: string; title: string; maxScore: number; }

const loadAssignments = (): Assignment[] => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? JSON.parse(v) : [{ id: 'final', title: 'Final Exam', maxScore: 100 }];
  } catch { return []; }
};

export default function PaProgress() {
  const { lang } = useApp();
  const de = lang === 'de';
  const { me, loading: meLoading } = useMe();
  const [grades, setGrades] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const assignments = loadAssignments();

  useEffect(() => {
    if (meLoading) return;
    if (!me?.id) { setLoading(false); return; }
    (async () => {
      try {
        const [s, c, lp, att] = await Promise.all([
          api<any[]>(`/surveys?participantId=${me.id}`).catch(() => []),
          api<any[]>('/courses').catch(() => []),
          api<any[]>(`/lesson-progress?participantId=${me.id}`).catch(() => []),
          api<any[]>(`/attendance/participant/${me.id}`).catch(() => []),
        ]);
        setGrades((Array.isArray(s) ? s : []).filter((x) => x.type === 'test'));
        setCourses(Array.isArray(c) ? c : []);
        setProgress(Array.isArray(lp) ? lp : []);
        setAttendance(Array.isArray(att) ? att : []);
      } catch { }
      finally { setLoading(false); }
    })();
  }, [me?.id, meLoading]);

  const pct = (score?: string) => {
    if (score && typeof score === 'string' && score.includes('/')) {
      const [g, m] = score.split('/').map((x) => Number(x.trim()));
      if (m > 0 && !isNaN(g) && !isNaN(m)) return Math.round((g / m) * 100);
    }
    return null;
  };

  // Learning Progress
  const totalSessions = courses.reduce((sum, c) => sum + (c.sessions?.length ?? 0), 0);
  const completedSessions = progress.filter((p) => p.completed).length;
  const lessonPct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  // Attendance
  const totalAtt = attendance.length;
  const presentAtt = attendance.filter((a) => a.present || a.status === 'present').length;
  const attPct = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : null;

  // Assignments + Grades
  const gradedAssignments = assignments.map((a) => {
    const g = grades.find((gr) => gr.title === a.title) ?? null;
    const p = g?.score ? pct(g.score) : null;
    return { ...a, grade: g, pct: p, passed: p !== null && p >= PASS_MARK };
  });

  const scoredList = gradedAssignments.filter((a) => a.pct !== null);
  const total = scoredList.length > 0
    ? Math.round(scoredList.reduce((s, a) => s + (a.pct ?? 0), 0) / scoredList.length)
    : null;
  const totalPassed = total !== null && total >= PASS_MARK;
  const passedCount = scoredList.filter((a) => a.passed).length;
  const failedCount = scoredList.filter((a) => !a.passed).length;
  const pendingCount = assignments.length - scoredList.length;

  const BootcampName = me?.Bootcamp?.name || (de ? 'Maßnahme' : 'Programme');

  if (meLoading || loading) return (
    <div className="card" style={{ padding: 20, color: C.muted, fontSize: 13 }}>…</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

      {/* ===== HEADER ===== */}
      <div className="card" style={{
        background: total !== null
          ? (totalPassed ? C.mint + '12' : C.rose + '12')
          : C.soft,
        border: `2px solid ${total !== null ? (totalPassed ? C.mint : C.rose) : C.line}`,
        padding: '20px 22px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14, flexShrink: 0,
            background: total !== null ? (totalPassed ? C.mint : C.rose) : C.iris,
            display: 'grid', placeItems: 'center',
          }}>
            {total !== null
              ? (totalPassed ? <CheckCircle2 size={28} color="#fff" /> : <XCircle size={28} color="#fff" />)
              : <Award size={28} color="#fff" />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
              {BootcampName}
            </div>
            <div style={{ fontSize: 19, fontWeight: 800, color: total !== null ? (totalPassed ? C.mint : C.rose) : C.iris }}>
              {total !== null
                ? (totalPassed
                  ? (de ? `Bestanden · ${total}%` : `Pass · ${total}%`)
                  : (de ? `Nicht bestanden · ${total}%` : `Fail · ${total}%`))
                : (de ? 'Noch keine Bewertungen' : 'No grades yet')}
            </div>
            {total !== null && (
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                {passedCount} {de ? 'bestanden' : 'passed'} ·{' '}
                {failedCount} {de ? 'nicht best.' : 'failed'} ·{' '}
                {de ? 'Durchschnitt' : 'Average'} {total}%
              </div>
            )}
          </div>
          {total !== null && (
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: totalPassed ? C.mint : C.rose, lineHeight: 1 }}>
                {total}%
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                {de ? 'Gesamt' : 'Overall'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.3fr 1fr' }}>

        {/* ===== ASSIGNMENTS TABLE ===== */}
        <div className="card" style={{ padding: '18px 8px 8px' }}>
          <div className="card-head" style={{ padding: '0 13px 14px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ClipboardList size={15} color={C.iris} />
              {de ? 'Meine Bewertungen' : 'My Grades'}
            </div>
            <span className="badge" style={{ background: C.mint + '18', color: C.mint }}>
              Pass ≥ {PASS_MARK}%
            </span>
          </div>

          {assignments.length === 0 && (
            <div style={{ padding: '0 13px 14px', fontSize: 12.5, color: C.muted }}>
              {de ? 'Keine Aufgaben.' : 'No assignments yet.'}
            </div>
          )}

          <table style={{ width: '100%' }}>
            <tbody>
              {gradedAssignments.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: i < gradedAssignments.length - 1 ? `1px solid ${C.lineSoft}` : 'none' }}>
                  <td style={{ padding: '11px 13px' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                      Max {a.maxScore} {de ? 'Punkte' : 'pts'}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '11px 8px', whiteSpace: 'nowrap' }}>
                    {a.grade?.score ? (
                      <span className="mono" style={{ fontWeight: 700, fontSize: 13, color: a.passed ? C.mint : C.rose }}>
                        {a.grade.score} · {a.pct}%
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: C.mutedLight }}>
                        {de ? 'ausstehend' : 'pending'}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', padding: '11px 13px 11px 6px' }}>
                    {a.grade?.score ? (
                      a.passed
                        ? <span className="badge" style={{ background: C.mint + '22', color: C.mint, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={12} /> {de ? 'Bestanden' : 'Pass'}
                          </span>
                        : <span className="badge" style={{ background: C.rose + '22', color: C.rose, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <XCircle size={12} /> {de ? 'Nicht best.' : 'Fail'}
                          </span>
                    ) : (
                      <span style={{ fontSize: 11, color: C.mutedLight }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Row */}
          {total !== null && (
            <div style={{
              margin: '8px 13px 6px', padding: '12px 14px', borderRadius: 10,
              background: totalPassed ? C.mint + '12' : C.rose + '12',
              border: `1px solid ${totalPassed ? C.mint : C.rose}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: totalPassed ? C.mint : C.rose }}>
                {de ? 'Gesamtdurchschnitt' : 'Overall Average'}
              </span>
              <span style={{ fontWeight: 800, fontSize: 17, color: totalPassed ? C.mint : C.rose }}>
                {total}% {totalPassed ? '✅' : '❌'}
              </span>
            </div>
          )}
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Learning Progress */}
          <div className="card">
            <div className="card-head">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <BookOpen size={14} color={C.iris} />
                {de ? 'Lernfortschritt' : 'Learning progress'}
              </div>
              <span className="mono" style={{ fontWeight: 700, color: C.iris, fontSize: 13 }}>{lessonPct}%</span>
            </div>
            <Bar2 pct={lessonPct} />
            <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>
              {completedSessions} / {totalSessions} {de ? 'Sitzungen' : 'sessions'}
            </div>
          </div>

          {/* Attendance */}
          <div className="card">
            <div className="card-head">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <TrendingUp size={14} color={C.amber} />
                {de ? 'Anwesenheit' : 'Attendance'}
              </div>
              {attPct !== null && (
                <span className="mono" style={{ fontWeight: 700, color: attPct >= 80 ? C.mint : C.amber, fontSize: 13 }}>
                  {attPct}%
                </span>
              )}
            </div>
            {attPct !== null ? (
              <>
                <Bar2 pct={attPct} kind={attPct >= 80 ? 'done' : 'low'} />
                <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>
                  {presentAtt} / {totalAtt} {de ? 'Sitzungen anwesend' : 'sessions attended'}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                {de ? 'Noch keine Daten.' : 'No data yet.'}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {de ? 'Zusammenfassung' : 'Summary'}
            </div>
            {([
              [de ? 'Bestanden' : 'Passed', passedCount, C.mint],
              [de ? 'Nicht best.' : 'Failed', failedCount, C.rose],
              [de ? 'Ausstehend' : 'Pending', pendingCount, C.amber],
            ] as [string, number, string][]).map(([label, val, col], i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0', borderBottom: i < 2 ? `1px solid ${C.lineSoft}` : 'none',
              }}>
                <span style={{ fontSize: 12.5, color: C.inkSoft }}>{label}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: col }}>{val}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}



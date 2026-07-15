import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Plus, X, Trash2, Award, CheckCircle2, XCircle, Pencil, Check, Download } from 'lucide-react';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import QuizModal from './QuizModal';

const PASS = 50;
const STORAGE_KEY = 'trainer_assignments';

export interface Assignment {
  id: string;
  title: string;
  maxScore: number;
}

export const loadAssignments = (): Assignment[] => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? JSON.parse(v) : [{ id: 'final', title: 'Final Exam', maxScore: 100 }];
  } catch { return []; }
};

export const saveAssignments = (a: Assignment[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); } catch {}
};

export default function TrAssignment() {
  const { lang } = useApp();
  const de = lang === 'de';

  const [assignments, setAssignments] = useState<Assignment[]>(loadAssignments());
  const [newTitle,    setNewTitle]    = useState('');
  const [newMax,      setNewMax]      = useState('100');
  const [adding,      setAdding]      = useState(false);
  const [editId,      setEditId]      = useState<string | null>(null);
  const [editTitle,   setEditTitle]   = useState('');
  const [editMax,     setEditMax]     = useState('');
  const [parts,       setParts]       = useState<any[]>([]);
  const [measures,    setMeasures]    = useState<any[]>([]);
  const [selMeasure,  setSelMeasure]  = useState('');
  const [grades,      setGrades]      = useState<Record<string, any[]>>({});
  const [quizzes,     setQuizzes]     = useState<any[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<Record<string, any[]>>({});
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [viewQuiz,     setViewQuiz]     = useState<any | null>(null);
  const [editQuiz,     setEditQuiz]     = useState<any | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => { saveAssignments(assignments); }, [assignments]);

  useEffect(() => {
    (async () => {
      try {
        const [data, meas] = await Promise.all([
          api<any[]>('/participants').catch(() => []),
          api<any[]>('/measures').catch(() => []),
        ]);
        const measList = Array.isArray(meas) ? meas : [];
        const partList = Array.isArray(data) ? data : [];
        // Only show measures that have participants
        const measWithParts = measList.filter(m => partList.some(p => p.measureId === m.id));
        setMeasures(measWithParts);
        console.log('[Assignment] measures with parts:', measWithParts.map(m => m.name));
        console.log('[Assignment] all parts:', partList.map(p => ({name:p.name,measureId:p.measureId})));
        // Auto-select first measure if only one
        if (measWithParts.length === 1) setSelMeasure(measWithParts[0].id);
        const _data = data;
        const list = Array.isArray(_data) ? _data : [];
        setParts(list);
        console.log('[parts]', list.map((p) => ({id: p.id, name: p.name})));
        const entries = await Promise.all(
          list.map(async (p) => {
            try {
              const s = await api<any[]>(`/surveys?participantId=${p.id}`);
              return { id: p.id as string, tests: (Array.isArray(s) ? s : []).filter((x: any) => x.type === 'test') };
            } catch { return { id: p.id as string, tests: [] }; }
          })
        );
        const map: Record<string, any[]> = {};
        entries.forEach((e) => { map[e.id] = e.tests; });
        setGrades(map);
      console.log('[grades map]', JSON.stringify(map));
      } catch { setParts([]); }
      finally { setLoading(false); }
    })();
  // load quizzes
  api('/quiz').then(async (q: any) => {
    const list = Array.isArray(q) ? q : [];
    setQuizzes(list);
    // Auto-load attempts for all quizzes
    const attMap = {};
    await Promise.all(list.map(async (quiz) => {
      const att = await api('/quiz/' + quiz.id + '/attempts').catch(() => []);
      attMap[quiz.id] = Array.isArray(att) ? att : [];
    }));
    setQuizAttempts(attMap);
  }).catch(() => {});
  }, []); // refresh on mount

  const refresh = async () => {
    try {
      const p2 = await api('/participants').catch(() => []);
      const pList = Array.isArray(p2) ? p2 : [];
      const entries = await Promise.all(pList.map(async (p: any) => {
        try {
          const s = await api('/surveys?participantId=' + p.id);
          return { id: p.id, tests: (Array.isArray(s) ? s : []).filter((x: any) => x.type === 'test') };
        } catch { return { id: p.id, tests: [] }; }
      }));
      const map: Record<string, any[]> = {};
      entries.forEach((e) => { map[e.id] = e.tests; });
      setGrades(map);
    } catch {}
  };

  const addAssignment = () => {
    const title = newTitle.trim();
    const max   = Number(newMax);
    if (!title || isNaN(max) || max <= 0) return;
    setAssignments((a) => [...a, { id: Date.now().toString(), title, maxScore: max }]);
    setNewTitle(''); setNewMax('100'); setAdding(false);
  };

  const removeAssignment = (id: string) => {
    if (!confirm(de ? 'Aufgabe löschen?' : 'Delete assignment?')) return;
    setAssignments((a) => a.filter((x) => x.id !== id));
  };

  const startEdit = (a: Assignment) => { setEditId(a.id); setEditTitle(a.title); setEditMax(String(a.maxScore)); };
  const saveEdit  = () => {
    const title = editTitle.trim();
    const max   = Number(editMax);
    if (!title || isNaN(max) || max <= 0) { setEditId(null); return; }
    setAssignments((prev) => prev.map((a) => a.id === editId ? { ...a, title, maxScore: max } : a));
    setEditId(null);
  };

  const filteredParts = selMeasure ? parts.filter(p => p.measureId === selMeasure) : parts;

  const getScore = (pid: string, a: Assignment) => {
    const all = grades[pid] ?? [];
    if (all.length === 0) return null;
    const exact = all.find((t) => t.title === a.title);
    if (exact) return exact;
    return all.reduce((best: any, curr: any) => {
      const bPct = best?.score ? parseInt(best.score) : 0;
      const cPct = curr?.score ? parseInt(curr.score) : 0;
      return cPct > bPct ? curr : best;
    }, all[0]);
  };
  const getPct = (score: string) => {
    if (!score?.includes('/')) return null;
    const [g, m] = score.split('/').map((x: string) => Number(x.trim()));
    return m > 0 && !isNaN(g) && !isNaN(m) ? Math.round((g / m) * 100) : null;
  };

  const getStats = (a: Assignment) => {
    const scored = parts.filter((p) => getScore(p.id, a)?.score);
    const passed = scored.filter((p) => {
      const pct = getPct(getScore(p.id, a)?.score ?? '');
      return pct !== null && pct >= PASS;
    });
    return { total: parts.length, scored: scored.length, passed: passed.length, failed: scored.length - passed.length };
  };

  // ===== EXPORT EXCEL =====
  const exportExcel = () => {
    const rows: any[] = [];
    parts.forEach((p) => {
      assignments.forEach((a) => {
        const s     = getScore(p.id, a);
        const score = s?.score ?? null;
        const pct   = score ? getPct(score) : null;
        rows.push({
          [de ? 'Teilnehmer'  : 'Participant']: p.name ?? '',
          [de ? 'Kontakt'     : 'Contact']:     p.contact ?? p.email ?? '',
          [de ? 'Aufgabe'     : 'Assignment']:  a.title,
          [de ? 'Max. Punkte' : 'Max. Score']:  a.maxScore,
          [de ? 'Punkte'      : 'Score']:       score ?? '',
          [de ? 'Prozent'     : 'Percent']:     pct !== null ? `${pct}%` : '',
          [de ? 'Bestanden'   : 'Passed']:      pct !== null ? (pct >= PASS ? (de ? 'Ja' : 'Yes') : (de ? 'Nein' : 'No')) : '',
        });
      });
    });
    if (!rows.length) { alert(de ? 'Keine Daten.' : 'No data.'); return; }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, de ? 'Aufgaben' : 'Assignments');
    ws['!cols'] = [{ wch: 22 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
    XLSX.writeFile(wb, `assignments_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

      {/* ===== HEADER ===== */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0F1228' }}>
            {de ? 'Aufgaben & Prüfungen' : 'Assignments & Exams'}
          </div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
            {de ? 'Hier verwaltest du alle Aufgaben.' : 'Manage assignments here.'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <select value={selMeasure} onChange={e => setSelMeasure(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', minWidth: 200 }}>
            <option value=''>{de ? 'Alle Bootcamps' : 'All Bootcamps'}</option>
            {measures.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={exportExcel}
            disabled={parts.length === 0}
          >
            <Download size={13} /> {de ? 'Exportieren' : 'Export'}
          </button>
          <div style={{ position: 'relative' }}>
            <button className='btn btn-primary' style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 5 }}
              onClick={() => setShowAssignMenu(s => !s)}>
              <Plus size={14} /> {de ? 'Neue Aufgabe' : 'New Assignment'} ▾
            </button>
            {showAssignMenu && (
              <div onClick={() => setShowAssignMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            )}
            {showAssignMenu && (
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: 'white', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 50, minWidth: 230, overflow: 'hidden' }}>
                <div style={{ padding: '8px 14px 6px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {de ? 'Aufgabentyp w�hlen' : 'Choose Assignment Type'}
                </div>

                <button onClick={() => { setShowAssignMenu(false); setShowQuizModal(true); }}
                  style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', borderTop: '1px solid #F1F5F9' }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#6D5DF6' }}>Quiz</span>
                  <span style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{de ? 'Eine richtige Antwort' : 'Single correct answer per question'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== ADD FORM ===== */}
      {adding && (
        <div className="card" style={{ border: `2px solid ${C.iris}`, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.iris, marginBottom: 12 }}>
            {de ? 'Neue Aufgabe erstellen' : 'Create New Assignment'}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addAssignment(); }}
              placeholder={de ? 'z.B. Final Exam, Quiz 1…' : 'e.g. Final Exam, Quiz 1…'}
              style={{ flex: 2, minWidth: 200, padding: '10px 13px', borderRadius: 9, border: `1.5px solid ${C.iris}`, fontSize: 13, outline: 'none' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number" min={1} value={newMax}
                onChange={(e) => setNewMax(e.target.value)}
                style={{ width: 80, padding: '10px 11px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13, outline: 'none', textAlign: 'center' }}
              />
              <span style={{ fontSize: 12.5, color: C.muted }}>{de ? 'Punkte' : 'pts'}</span>
            </div>
            <button className="btn btn-primary" onClick={addAssignment} style={{ padding: '9px 18px' }}>
              <Plus size={13} /> {de ? 'Erstellen' : 'Create'}
            </button>
            <button className="btn" onClick={() => setAdding(false)} style={{ padding: '9px', background: C.soft }}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ===== NO ASSIGNMENTS ===== */}
      {assignments.length === 0 && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: C.muted, fontSize: 13 }}>
          {de ? 'Keine Aufgaben. Erstelle deine erste Aufgabe.' : 'No assignments. Create your first one.'}
        </div>
      )}

      {/* ===== ASSIGNMENT CARDS ===== */}
      {assignments.map((a) => {
        const stats     = getStats(a);
        const isEditing = editId === a.id;
        return (
          <div key={a.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>

            {/* Card Header */}
            <div style={{ padding: '16px 18px', borderBottom: `1px solid ${C.lineSoft}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                background: `linear-gradient(135deg, ${C.iris}, #8B7FF8)`,
                display: 'grid', placeItems: 'center',
              }}>
                <Award size={20} color="#fff" />
              </div>

              <div style={{ flex: 1 }}>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      autoFocus value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditId(null); }}
                      style={{ flex: 2, minWidth: 150, padding: '7px 10px', borderRadius: 8, border: `1.5px solid ${C.iris}`, fontSize: 13, outline: 'none' }}
                    />
                    <input
                      type="number" min={1} value={editMax}
                      onChange={(e) => setEditMax(e.target.value)}
                      style={{ width: 75, padding: '7px 10px', borderRadius: 8, border: `1px solid ${C.line}`, fontSize: 13, outline: 'none', textAlign: 'center' }}
                    />
                    <span style={{ fontSize: 12, color: C.muted }}>pts</span>
                    <button style={iconMini} onClick={saveEdit}><Check size={14} color={C.mint} /></button>
                    <button style={iconMini} onClick={() => setEditId(null)}><X size={14} /></button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                      {de ? `Max. ${a.maxScore} Punkte · Bestehensgrenze: ${PASS}%` : `Max ${a.maxScore} pts · Pass mark: ${PASS}%`}
                    </div>
                  </>
                )}
              </div>

              {!isEditing && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button style={iconMini} onClick={() => startEdit(a)} title={de ? 'Bearbeiten' : 'Edit'}>
                    <Pencil size={14} color={C.muted} />
                  </button>
                  <button style={iconMini} onClick={() => removeAssignment(a.id)} title={de ? 'Löschen' : 'Delete'}>
                    <Trash2 size={14} color={C.muted} />
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', padding: '12px 18px' }}>
              {[
                [de ? 'Teilnehmer' : 'Participants', stats.total,  C.iris],
                [de ? 'Bewertet'   : 'Graded',       stats.scored, C.amber],
                [de ? 'Bestanden'  : 'Passed',        stats.passed, C.mint],
                [de ? 'Nicht best.': 'Failed',        stats.failed, C.rose],
              ].map(([label, val, col]: any, i, arr) => (
                <div key={i} style={{
                  flex: 1, textAlign: 'center', padding: '8px 4px',
                  borderRight: i < arr.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: col }}>{val}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            {stats.scored > 0 && (
              <div style={{ padding: '0 18px 14px' }}>
                <div style={{ display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden', background: C.line }}>
                  <div style={{ width: `${Math.round((stats.passed / stats.total) * 100)}%`, background: C.mint, transition: 'width .4s' }} />
                  <div style={{ width: `${Math.round((stats.failed / stats.total) * 100)}%`, background: C.rose, transition: 'width .4s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10.5, color: C.muted }}>
                  <span style={{ color: C.mint }}>✓ {Math.round((stats.passed / stats.total) * 100)}% {de ? 'bestanden' : 'passed'}</span>
                  <span style={{ color: C.rose }}>✗ {Math.round((stats.failed / stats.total) * 100)}% {de ? 'nicht best.' : 'failed'}</span>
                </div>
              </div>
            )}

            {/* Participants list */}
            {!loading && parts.length > 0 && (
              <div style={{ borderTop: `1px solid ${C.lineSoft}`, padding: '8px 18px 12px' }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {de ? 'Teilnehmer' : 'Participants'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {filteredParts.map((p) => {
                    const s      = getScore(p.id, a);
                    const qScore = quizzes.length > 0 ? (() => { const allAtt = Object.values(quizAttempts).flat(); const pAtt = allAtt.filter((at) => at.participantId === p.id); if (!pAtt.length) return null; const best = pAtt.reduce((b, x) => (x.score > b.score ? x : b), pAtt[0]); return best; })() : null;
                    if (p.id === 'cmrjtx8ku0001cdu9eqxzorm6') console.log('[JSX getScore] samer:', s, '| a.title:', a.title, '| grades:', grades[p.id]?.length);
                    const pct    = s?.score ? getPct(s.score) : null;
                    const passed = pct !== null && pct >= PASS;
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 9, background: C.soft }}>
                        <div style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                        {qScore ? (
                          <>
                            <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: qScore.passed ? C.mint : C.rose }}>
                              {qScore.score}/{qScore.total} · {Math.round(qScore.score/qScore.total*100)}%
                            </span>
                            {qScore.passed ? <CheckCircle2 size={15} color={C.mint} /> : <XCircle size={15} color={C.rose} />}
                          </>
                        ) : s?.score ? (
                          <>
                            <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: passed ? C.mint : C.rose }}>
                              {s.score} · {pct}%
                            </span>
                            {passed ? <CheckCircle2 size={15} color={C.mint} /> : <XCircle size={15} color={C.rose} />}
                          </>
                        ) : (
                          <span style={{ fontSize: 11.5, color: C.muted }}>
                            {de ? 'Noch nicht bewertet' : 'Not graded yet'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {/* Quiz list */}
      {quizzes.length > 0 && (
        <div className='card' style={{ marginTop: 16, padding: '18px 16px' }}>
          <div className='card-title' style={{ marginBottom: 12 }}>{de ? 'Quizzes' : 'Quizzes'} ({quizzes.length})</div>
          {quizzes.map((q) => {
            const attempts = (quizAttempts && quizAttempts[q.id]) || [];
            const byPart = {};
            attempts.forEach((a) => { if (!byPart[a.participantId]) byPart[a.participantId] = []; byPart[a.participantId].push(a); });
            const partIds = Object.keys(byPart);
            const passed = partIds.filter(pid => byPart[pid].some((a) => a.passed)).length;
            const failed = partIds.filter(pid => byPart[pid].every((a) => !a.passed)).length;
            const isExp = expandedQuiz === q.id;
            return (
              <div key={q.id} style={{ borderRadius: 9, background: '#F8FAFF', marginBottom: 8, border: '1px solid #E8EEFF', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={async () => {
                    if (isExp) { setExpandedQuiz(null); return; }
                    setExpandedQuiz(q.id);
                    if (!quizAttempts[q.id]) {
                      const att = await api('/quiz/' + q.id + '/attempts').catch(() => []);
                      setQuizAttempts((prev) => ({ ...prev, [q.id]: Array.isArray(att) ? att : [] }));
                    }
                  }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{q.title}</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, display: 'flex', gap: 10 }}>
                      <span>{q.questions?.length ?? 0} {de ? 'Fragen' : 'Q'}</span>
                      {partIds.length > 0 && (<><span style={{ color: '#0FB6A0' }}>+{passed} {de ? 'bestanden' : 'passed'}</span><span style={{ color: '#F4475F' }}>-{failed} {de ? 'n. bestanden' : 'failed'}</span></>)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select defaultValue='' onClick={(e) => e.stopPropagation()} onChange={async (e) => {
                      const pid = e.target.value; if (!pid) return; e.target.value = '';
                      try {
                        await fetch('http://localhost:3000/api/v1/quiz/' + q.id + '/attempts/' + pid, { method: 'DELETE', headers: { Authorization: 'Bearer ' + localStorage.getItem('aio_token') } });
                        setQuizAttempts((prev) => ({ ...prev, [q.id]: (prev[q.id] || []).filter((a) => a.participantId !== pid) }));
                        alert(de ? 'Quiz zurueckgesetzt!' : 'Quiz reset!');
                      } catch { alert('Error'); }
                    }} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 7, border: '1px solid #F59E0B55', color: '#F59E0B', cursor: 'pointer', outline: 'none', background: '#FFFBEB' }}>
                      <option value=''>{de ? 'Zuruecksetzen...' : 'Reset for...'}</option>
                      {parts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button onClick={(e) => { e.stopPropagation(); setViewQuiz(q); }} title='View' style={{ background: 'none', border: '1px solid #6D5DF630', borderRadius: 6, cursor: 'pointer', color: '#6D5DF6', fontSize: 11, padding: '3px 8px', fontWeight: 600 }}>{de ? 'Ansehen' : 'View'}</button>
                    <button onClick={(e) => { e.stopPropagation(); setEditQuiz(q); setEditTitle(q.title); }} title='Edit' style={{ background: 'none', border: '1px solid #F59E0B30', borderRadius: 6, cursor: 'pointer', color: '#F59E0B', fontSize: 11, padding: '3px 8px', fontWeight: 600 }}>{de ? 'Bearbeiten' : 'Edit'}</button>
                    <button onClick={async (e) => { e.stopPropagation(); if (!window.confirm(de ? 'Quiz l�schen?' : 'Delete this quiz?')) return; await api('/quiz/' + q.id, { method: 'DELETE' }); setQuizzes((qs: any[]) => qs.filter(x => x.id !== q.id)); }} title='Delete' style={{ background: 'none', border: '1px solid #F4475F30', borderRadius: 6, cursor: 'pointer', color: '#F4475F', fontSize: 11, padding: '3px 8px', fontWeight: 600 }}>{de ? 'L�schen' : 'Delete'}</button>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>{isExp ? '-' : '+'}</span>
                  </div>
                </div>
                {isExp && (
                  <div style={{ borderTop: '1px solid #E8EEFF', padding: '10px 14px' }}>
                    {partIds.length === 0 ? (
                      <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }}>{de ? 'Noch keine Versuche' : 'No attempts yet'}</div>
                    ) : (
                      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                        <thead><tr style={{ color: '#64748B', fontSize: 11 }}>
                          <th style={{ textAlign: 'left', paddingBottom: 6 }}>{de ? 'Teilnehmer' : 'Participant'}</th>
                          <th style={{ textAlign: 'center', paddingBottom: 6 }}>{de ? 'Versuche' : 'Attempts'}</th>
                          <th style={{ textAlign: 'center', paddingBottom: 6 }}>{de ? 'Bestes Ergebnis' : 'Best Score'}</th>
                          <th style={{ textAlign: 'center', paddingBottom: 6 }}>Status</th>
                        </tr></thead>
                        <tbody>
                          {partIds.map(pid => {
                            const pa = byPart[pid];
                            const best = pa.reduce((b, a) => (a.score > b.score ? a : b), pa[0]);
                            const pct = best.total > 0 ? Math.round((best.score / best.total) * 100) : 0;
                            const pName = parts.find((p) => p.id === pid)?.name || pid.slice(0,8);
                            return (
                              <tr key={pid} style={{ borderTop: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '6px 0', fontWeight: 500 }}>{pName}</td>
                                <td style={{ textAlign: 'center', color: '#64748B' }}>{pa.length}</td>
                                <td style={{ textAlign: 'center', fontWeight: 700, color: best.passed ? '#0FB6A0' : '#F4475F' }}>{best.score}/{best.total} ({pct}%)</td>
                                <td style={{ textAlign: 'center' }}><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: best.passed ? '#0FB6A020' : '#F4475F15', color: best.passed ? '#0FB6A0' : '#F4475F' }}>{best.passed ? (de ? 'Bestanden' : 'Passed') : (de ? 'Nicht bestanden' : 'Failed')}</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* ===== VIEW QUIZ MODAL ===== */}
      {viewQuiz && (
        <div onClick={() => setViewQuiz(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,40,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className='card' style={{ width: '100%', maxWidth: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{viewQuiz.title}</div>
              <button onClick={() => setViewQuiz(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94A3B8' }}>�</button>
            </div>
            <div style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 12, color: '#64748B' }}>{viewQuiz.questions?.length ?? 0} {de ? 'Fragen' : 'questions'} � Pass mark: {viewQuiz.passMark ?? 50}%</div>
              {(viewQuiz.questions || []).map((q: any, i: number) => (
                <div key={q.id} style={{ border: '1px solid #E2E8F0', borderRadius: 9, padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>{i+1}. {q.question}</div>
                  {['A','B','C','D'].filter(o => q['option'+o]).map(o => (
                    <div key={o} style={{ fontSize: 12.5, padding: '5px 10px', borderRadius: 6, marginBottom: 4, background: q.correctAnswer === o ? '#0FB6A015' : '#F8FAFC', color: q.correctAnswer === o ? '#0FB6A0' : '#475569', fontWeight: q.correctAnswer === o ? 700 : 400, border: q.correctAnswer === o ? '1px solid #0FB6A030' : '1px solid transparent' }}>
                      {o}. {q['option'+o]} {q.correctAnswer === o ? '?' : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button className='btn btn-ghost' onClick={() => setViewQuiz(null)}>{de ? 'Schlie�en' : 'Close'}</button>
            </div>
          </div>
        </div>
      )}
      {/* ===== EDIT QUIZ MODAL ===== */}
      {editQuiz && (
        <div onClick={() => setEditQuiz(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,40,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} className='card' style={{ width: '100%', maxWidth: 420, padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{de ? 'Quiz bearbeiten' : 'Edit Quiz'}</div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {de ? 'Titel' : 'Title'}
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' }} autoFocus />
            </label>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className='btn btn-ghost' onClick={() => setEditQuiz(null)}>{de ? 'Abbrechen' : 'Cancel'}</button>
              <button className='btn btn-primary' onClick={async () => {
                if (!editTitle.trim()) return;
                await api('/quiz/' + editQuiz.id, { method: 'PATCH', body: JSON.stringify({ title: editTitle }) });
                setQuizzes((qs: any[]) => qs.map(q => q.id === editQuiz.id ? { ...q, title: editTitle } : q));
                setEditQuiz(null);
              }}>{de ? 'Speichern' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
      {showQuizModal && (
        <QuizModal
          onClose={() => setShowQuizModal(false)}
          onCreated={(q: any) => { setQuizzes((qs: any[]) => [q, ...qs]); setShowQuizModal(false); }}
        />
      )}
    </div>
  );
}

const iconMini: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 4, display: 'grid', placeItems: 'center', borderRadius: 6,
};

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Plus, X, Trash2, Award, CheckCircle2, XCircle, Pencil, Check, Download } from 'lucide-react';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api';

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
  const [grades,      setGrades]      = useState<Record<string, any[]>>({});
  const [loading,     setLoading]     = useState(true);

  useEffect(() => { saveAssignments(assignments); }, [assignments]);

  useEffect(() => {
    (async () => {
      try {
        const data = await api<any[]>('/participants');
        const list = Array.isArray(data) ? data : [];
        setParts(list);
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
      } catch { setParts([]); }
      finally { setLoading(false); }
    })();
  }, []);

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

  const getScore = (pid: string, a: Assignment) =>
    (grades[pid] ?? []).find((t) => t.title === a.title) ?? null;

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
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
            onClick={exportExcel}
            disabled={parts.length === 0}
          >
            <Download size={13} /> {de ? 'Exportieren' : 'Export'}
          </button>
          <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={() => setAdding(true)}>
            <Plus size={14} /> {de ? 'Neue Aufgabe' : 'New Assignment'}
          </button>
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
                  {parts.map((p) => {
                    const s      = getScore(p.id, a);
                    const pct    = s?.score ? getPct(s.score) : null;
                    const passed = pct !== null && pct >= PASS;
                    return (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 9, background: C.soft }}>
                        <div style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                        {s?.score ? (
                          <>
                            <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: passed ? C.mint : C.rose }}>
                              {s.score} · {pct}%
                            </span>
                            {passed
                              ? <CheckCircle2 size={15} color={C.mint} />
                              : <XCircle     size={15} color={C.rose} />}
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
    </div>
  );
}

const iconMini: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 4, display: 'grid', placeItems: 'center', borderRadius: 6,
};

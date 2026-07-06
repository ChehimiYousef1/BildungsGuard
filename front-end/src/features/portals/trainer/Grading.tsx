import React, { useState, useEffect } from 'react';
import { translateText } from '../../../lib/translateName';
import {
  Award, CheckCircle2, BookOpen, Users,
  ChevronDown, X, Check
} from 'lucide-react';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { Avatar } from '../../../components/Avatar';
import { api } from '../../../lib/api';
import { MASSNAHMEN, INIT_PART } from '../../../data';

const PASS_MARK = 50;

export default function TrGrade() {
  const { t, lang } = useApp();
  const de = lang === 'de';

  const [measures,     setMeasures]     = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [surveys,      setSurveys]      = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [selMeasure,   setSelMeasure]   = useState('');

  // Grading modal
  const [gradingSel, setGradingSel] = useState<any | null>(null);
  const [score,      setScore]      = useState('');
  const [taskName,   setTaskName]   = useState('');
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const [m, p, sv] = await Promise.all([
          api<any[]>('/measures').catch(() => []),
          api<any[]>('/participants').catch(() => []),
          api<any[]>('/surveys').catch(() => []),
        ]);

        const mList = Array.isArray(m) && m.length > 0
          ? m
          : MASSNAHMEN.map((x) => ({ id: x.id, name: x.name, status: x.status }));

        const pList = Array.isArray(p) && p.length > 0
          ? p
          : INIT_PART.map((x, i) => ({ id: `p-${i}`, ...x }));

        setMeasures(mList);
        setParticipants(pList);
        setSurveys(Array.isArray(sv) ? sv : []);
        if (mList.length > 0) setSelMeasure(mList[0].id);
      } catch {
        const mList = MASSNAHMEN.map((x) => ({ id: x.id, name: x.name, status: x.status }));
        const pList = INIT_PART.map((x, i) => ({ id: `p-${i}`, ...x }));
        setMeasures(mList);
        setParticipants(pList);
        if (mList.length > 0) setSelMeasure(mList[0].id);
      } finally { setLoading(false); }
    })();
  }, []);

  const bootcampParts = participants.filter(
    (p) => p.measureId === selMeasure || p.measure?.id === selMeasure
  );

  const selectedMeasure = measures.find((m) => m.id === selMeasure);

  const getScore = (participantId: string) => {
    const sv = surveys.find((s) => s.participantId === participantId && s.type === 'test');
    return sv?.score ?? null;
  };

  const openGrading = (p: any) => {
    setGradingSel(p);
    setScore('');
    setTaskName('Modul 3 · Statistik-Quiz');
  };

  const submitGrade = async () => {
    if (!gradingSel || !score) return;
    setSaving(true);
    try {
      await api('/surveys', {
        method: 'POST',
        body: JSON.stringify({
          participantId: gradingSel.id,
          type:          'test',
          title:         taskName,
          score:         `${score}/100`,
          rating:        Math.round(parseFloat(score) / 20),
          surveyDate:    new Date().toLocaleDateString('de-DE'),
        }),
      });
      setSaved((prev) => new Set([...prev, gradingSel.id]));
      setGradingSel(null);
      // reload surveys
      const sv = await api<any[]>('/surveys').catch(() => []);
      setSurveys(Array.isArray(sv) ? sv : []);
    } catch (e) {
      console.error(e);
      alert(de ? 'Fehler beim Speichern.' : 'Failed to save grade.');
    } finally { setSaving(false); }
  };

  // Stats
  const graded   = bootcampParts.filter((p) => getScore(p.id) !== null || saved.has(p.id)).length;
  const pending  = bootcampParts.length - graded;
  const passedN  = bootcampParts.filter((p) => {
    const s = getScore(p.id);
    if (!s) return false;
    const num = parseFloat(s.split('/')[0]);
    return num >= PASS_MARK;
  }).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ===== STATS ===== */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          [de ? 'Ausstehend' : 'Pending',   pending,                                    C.amber],
          [de ? 'Bewertet'   : 'Graded',    graded,                                     C.mint],
          [de ? 'Bestanden'  : 'Passed',    `${bootcampParts.length ? Math.round((passedN / bootcampParts.length) * 100) : 0}%`, C.iris],
        ].map(([label, val, col]: any, i) => (
          <div key={i} className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: col }}>{val}</div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ===== GRADING TABLE ===== */}
      <div className="card" style={{ padding: '19px 8px 8px' }}>
        <div className="card-head" style={{ padding: '0 13px 14px' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={15} color={C.iris} />
            {t('open_grading')}
          </div>
        </div>

        {/* Bootcamp selector */}
        <div style={{ padding: '0 13px 14px' }}>
          <select
            value={selMeasure}
            onChange={(e) => setSelMeasure(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13, outline: 'none', minWidth: 240, cursor: 'pointer' }}
          >
            {measures.map((m) => (
              <option key={m.id} value={m.id}>{translateText(m.name, lang)}</option>
            ))}
          </select>

          {/* Bootcamp badge */}
          {selectedMeasure && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 10, padding: '5px 12px', borderRadius: 20, background: C.iris + '12', fontSize: 12, color: C.iris, fontWeight: 600 }}>
              <BookOpen size={12} /> {translateText(selectedMeasure?.name ?? "", lang)}
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>· {bootcampParts.length} {de ? 'TN' : 'participants'}</span>
            </div>
          )}
        </div>

        {loading && <div style={{ padding: '0 13px 20px', color: C.muted, fontSize: 13 }}>…</div>}

        {!loading && bootcampParts.length === 0 && (
          <div style={{ padding: '0 13px 20px', color: C.muted, fontSize: 13 }}>
            {de ? 'Keine Teilnehmer in diesem Bootcamp.' : 'No participants in this bootcamp.'}
          </div>
        )}

        {!loading && bootcampParts.length > 0 && (
          <div className="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>{de ? 'Teilnehmer' : 'Participant'}</th>
                  <th>Bootcamp</th>
                  <th className="hide-mobile">{de ? 'Aufgabe' : 'Task'}</th>
                  <th>{de ? 'Ergebnis' : 'Score'}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bootcampParts.map((p, i) => {
                  const existingScore = getScore(p.id);
                  const isSaved       = saved.has(p.id);
                  const scoreNum      = existingScore ? parseFloat(existingScore.split('/')[0]) : null;
                  const passed        = scoreNum !== null ? scoreNum >= PASS_MARK : null;

                  return (
                    <tr key={p.id ?? i} className="row">
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar n={p.name} c={p.c} size={30} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                            {p.status && <div style={{ fontSize: 11, color: C.muted }}>{p.status}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.iris, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: C.iris + '10' }}>
                          <BookOpen size={11} />
                          {translateText(selectedMeasure?.name ?? "", lang) ?? '—'}
                        </span>
                      </td>
                      <td className="hide-mobile" style={{ fontSize: 12.5, color: C.muted }}>
                        Modul 3 · Statistik-Quiz
                      </td>
                      <td>
                        {(existingScore || isSaved) ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: passed ? C.mint : C.rose }}>
                              {existingScore ?? '—'}
                            </span>
                            {passed !== null && (
                              <span className="badge" style={{ background: passed ? C.mint + '18' : C.rose + '18', color: passed ? C.mint : C.rose, fontSize: 10 }}>
                                {passed ? (de ? 'Bestanden ✅' : 'Passed ✅') : (de ? 'Nicht bestanden' : 'Failed')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: C.muted }}>—</span>
                        )}
                      </td>
                      <td>
                        {(existingScore || isSaved) ? (
                          <button className="btn btn-ghost" style={{ padding: '5px 11px', fontSize: 11.5 }}
                            onClick={() => openGrading(p)}>
                            {de ? 'Ändern' : 'Edit'}
                          </button>
                        ) : (
                          <button className="btn btn-primary" style={{ padding: '6px 13px', fontSize: 12 }}
                            onClick={() => openGrading(p)}>
                            {t('grade')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== GRADING MODAL ===== */}
      {gradingSel && (
        <div onClick={() => !saving && setGradingSel(null)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 420, padding: 24 }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {de ? 'Bewertung eingeben' : 'Enter grade'}
              </div>
              <button onClick={() => setGradingSel(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            {/* Participant info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: C.soft, marginBottom: 16 }}>
              <Avatar n={gradingSel.name} c={gradingSel.c} size={36} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{gradingSel.name}</div>
                <div style={{ fontSize: 12, color: C.iris, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BookOpen size={11} /> {translateText(selectedMeasure?.name ?? "", lang) ?? '—'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              {/* Task */}
              <label style={lbl}>{de ? 'Aufgabe / Test' : 'Task / Test'}
                <input
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  style={inp}
                  placeholder="z.B. Modul 3 · Statistik-Quiz"
                />
              </label>

              {/* Score */}
              <label style={lbl}>{de ? 'Punkte (0–100)' : 'Score (0–100)'}
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="0" max="100"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    style={{ ...inp, paddingRight: 50 }}
                    placeholder="0–100"
                  />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: C.muted, marginTop: 3 }}>
                    / 100
                  </span>
                </div>
              </label>

              {/* Pass indicator */}
              {score !== '' && (
                <div style={{
                  padding: '10px 14px', borderRadius: 9,
                  background: parseFloat(score) >= PASS_MARK ? C.mint + '10' : C.rose + '10',
                  border: `1px solid ${parseFloat(score) >= PASS_MARK ? C.mint : C.rose}`,
                  fontSize: 13, fontWeight: 600,
                  color: parseFloat(score) >= PASS_MARK ? C.mint : C.rose,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {parseFloat(score) >= PASS_MARK
                    ? <><CheckCircle2 size={15} /> {de ? `Bestanden ✅ (Mindest: ${PASS_MARK}%)` : `Passed ✅ (Min: ${PASS_MARK}%)`}</>
                    : <><X size={15} /> {de ? `Nicht bestanden ❌ (Mindest: ${PASS_MARK}%)` : `Failed ❌ (Min: ${PASS_MARK}%)`}</>}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving} onClick={() => setGradingSel(null)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={saving || !score} onClick={submitGrade}>
                  {saving ? '…' : (de ? 'Speichern' : 'Save')}
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





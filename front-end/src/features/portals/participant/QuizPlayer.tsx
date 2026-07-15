import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, XCircle, Clock, Trophy } from 'lucide-react';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api';
import { useMe } from './useMe';

interface QuizPlayerProps {
  quiz: any;
  onClose: () => void;
  onComplete?: (result: any) => void;
}

const OPTS = ['A','B','C','D'] as const;

export default function QuizPlayer({ quiz, onClose, onComplete }: QuizPlayerProps) {
  const { lang } = useApp();
  const de = lang === 'de';
  const { me } = useMe();
  const [answers, setAnswers]   = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const timer = useRef<any>(null);

  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timer.current = setTimeout(() => setTimeLeft(t => (t ?? 1) - 1), 1000);
    return () => clearTimeout(timer.current);
  }, [timeLeft, submitted]);

  const handleSubmit = async () => {
    clearTimeout(timer.current);
    setSubmitting(true);
    try {
      const res = await api(`/quiz/${quiz.id}/attempt`, {
        method: 'POST',
        body: JSON.stringify({
          participantId: me?.id,
          answers,
        }),
      });
      localStorage.setItem('quiz_grade_updated', '1');
      setResult(res);
      setSubmitted(true);
      onComplete?.(res);
    } finally { setSubmitting(false); }
  };

  const questions: any[] = quiz.questions || [];
  const answered = Object.keys(answers).length;
  const fmtTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,40,.55)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="card"
        style={{ width: '100%', maxWidth: 640, maxHeight: '92vh', display: 'flex',
          flexDirection: 'column', overflow: 'hidden', padding: 0 }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #E2E8F0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{quiz.title}</div>
            {quiz.description && (
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{quiz.description}</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {timeLeft !== null && !submitted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13,
                fontWeight: 600, color: timeLeft < 60 ? C.rose : C.amber }}>
                <Clock size={14} /> {fmtTime(timeLeft)}
              </div>
            )}
            <button onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 20 }}>
          {submitted && result ? (
            /* ── Results screen ── */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 16, padding: '20px 0' }}>
              {result.passed
                ? <CheckCircle2 size={56} color={C.mint} />
                : <XCircle size={56} color={C.rose} />}
              <div style={{ fontSize: 22, fontWeight: 700,
                color: result.passed ? C.mint : C.rose }}>
                {result.passed
                  ? (de ? 'Bestanden! 🎉' : 'Passed! 🎉')
                  : (de ? 'Nicht bestanden' : 'Not Passed')}
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: C.iris }}>
                {result.pct}%
              </div>
              <div style={{ fontSize: 14, color: C.muted }}>
                {result.score} / {result.total} {de ? 'Punkte' : 'points'}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {de ? `Mindestpunktzahl: ${quiz.passMark ?? 50}%` : `Pass mark: ${quiz.passMark ?? 50}%`}
              </div>
              <div style={{ marginTop: 8, padding: '10px 20px', borderRadius: 10,
                background: result.passed ? C.mint + '15' : C.rose + '12',
                fontSize: 13, color: result.passed ? C.mint : C.rose, fontWeight: 600 }}>
                {de
                  ? `Ihr Ergebnis wurde automatisch in Ihrem Fortschritt gespeichert.`
                  : `Your result has been automatically saved to your progress.`}
              </div>

              {/* Review answers */}
              <div style={{ width: '100%', marginTop: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
                  {de ? 'Antworten überprüfen' : 'Review Answers'}
                </div>
                {questions.map((q, i) => {
                  const chosen = answers[q.id];
                  const correct = q.correctAnswer;
                  const isCorrect = chosen === correct;
                  return (
                    <div key={q.id} style={{ marginBottom: 12, padding: 12, borderRadius: 8,
                      background: isCorrect ? C.mint + '10' : C.rose + '10',
                      border: `1px solid ${isCorrect ? C.mint : C.rose}30` }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>
                        {i+1}. {q.question}
                      </div>
                      {OPTS.filter(o => (q as any)[`option${o}`]).map(o => {
                        const val = (q as any)[`option${o}`];
                        const isChosen = chosen === o;
                        const isRight = correct === o;
                        return (
                          <div key={o} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 6,
                            marginBottom: 2,
                            background: isRight ? C.mint+'25' : isChosen&&!isRight ? C.rose+'25' : 'transparent',
                            fontWeight: isRight || isChosen ? 600 : 400,
                            color: isRight ? C.mint : isChosen&&!isRight ? C.rose : '#64748B' }}>
                            {o}. {val}
                            {isRight && ' ✓'}{isChosen && !isRight && ' ✗'}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── Questions ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontSize: 12, color: C.muted }}>
                {de ? `${answered} von ${questions.length} Fragen beantwortet`
                     : `${answered} of ${questions.length} questions answered`}
              </div>
              {questions.map((q, i) => (
                <div key={q.id} style={{ border: `1px solid ${answers[q.id] ? C.iris+'30' : '#E2E8F0'}`,
                  borderRadius: 10, padding: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 12 }}>
                    {i+1}. {q.question}
                    {q.points > 1 && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: C.muted, fontWeight: 400 }}>
                        ({q.points} {de ? 'Punkte' : 'pts'})
                      </span>
                    )}
                    {q.topic && (
                      <span style={{ marginLeft: 8, fontSize: 10, color: C.iris, fontWeight: 500,
                        background: C.iris+'15', borderRadius: 10, padding: '1px 7px' }}>
                        {q.topic}
                      </span>
                    )}
                  </div>
                  {OPTS.filter(o => (q as any)[`option${o}`]).map(o => {
                    const val = (q as any)[`option${o}`];
                    const sel = answers[q.id] === o;
                    return (
                      <button key={o} onClick={() => setAnswers(a => ({ ...a, [q.id]: o }))}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                          padding: '10px 14px', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
                          border: sel ? `2px solid ${C.iris}` : '1.5px solid #E2E8F0',
                          background: sel ? C.iris + '10' : 'transparent',
                          textAlign: 'left', fontSize: 13 }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          border: sel ? `2px solid ${C.iris}` : '1.5px solid #CBD5E1',
                          background: sel ? C.iris : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: sel ? '#fff' : '#94A3B8' }}>
                          {o}
                        </div>
                        <span style={{ color: sel ? C.iris : '#1E293B', fontWeight: sel ? 600 : 400 }}>
                          {val}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: C.muted }}>
              {answered < questions.length && (
                de ? `Noch ${questions.length - answered} Fragen offen`
                   : `${questions.length - answered} questions remaining`
              )}
            </div>
            <button className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              disabled={submitting || answered === 0}
              onClick={handleSubmit}>
              <Trophy size={14} />
              {submitting ? '…' : (de ? 'Abgeben' : 'Submit Quiz')}
            </button>
          </div>
        )}
        {submitted && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0',
            display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={onClose}>
              {de ? 'Schließen' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
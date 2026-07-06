import React, { useState, useEffect } from 'react';
import { Award, Download, XCircle, CheckCircle2, Lock } from 'lucide-react';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { api, getToken } from '../../../lib/api';
import { useMe } from './useMe';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';
const PASS_MARK = 50;
const STORAGE_KEY = 'trainer_assignments';

interface Assignment { id: string; title: string; maxScore: number; }

const loadAssignments = (): Assignment[] => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? JSON.parse(v) : [{ id: 'final', title: 'Final Exam', maxScore: 100 }];
  } catch { return []; }
};

export default function PaCerts() {
  const { lang } = useApp();
  const de = lang === 'de';
  const { me, loading: meLoading } = useMe();
  const [certs, setCerts] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gen, setGen] = useState(false);
  const assignments = loadAssignments();

  useEffect(() => {
    if (meLoading || !me?.id) { setLoading(false); return; }
    (async () => {
      try {
        const [d, s] = await Promise.all([
          api<any[]>(`/documents/participant/${me.id}`).catch(() => []),
          api<any[]>(`/surveys?participantId=${me.id}`).catch(() => []),
        ]);
        setCerts((Array.isArray(d) ? d : []).filter((x) => /cert|zeugnis|zertifikat/i.test(x.type || '')));
        setGrades((Array.isArray(s) ? s : []).filter((x) => x.type === 'test'));
      } catch { }
      finally { setLoading(false); }
    })();
  }, [me?.id, meLoading]);

  const pct = (score?: string) => {
    if (!score?.includes('/')) return null;
    const [g, m] = score.split('/').map((x) => Number(x.trim()));
    return m > 0 && !isNaN(g) && !isNaN(m) ? Math.round((g / m) * 100) : null;
  };

  const scoredList = assignments
    .map((a) => {
      const g = grades.find((gr) => gr.title === a.title);
      return g?.score ? pct(g.score) : null;
    })
    .filter((x): x is number => x !== null);

  const total = scoredList.length > 0
    ? Math.round(scoredList.reduce((a, b) => a + b, 0) / scoredList.length)
    : null;
  const passed = total !== null && total >= PASS_MARK;
  const hasGrades = scoredList.length > 0;

  const openDoc = async (id: string) => {
    try {
      const token = getToken();
      const res = await fetch(`${API}/documents/${id}/file`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) { alert(de ? 'Datei nicht verfügbar.' : 'File not available.'); return; }
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), '_blank');
    } catch (e) { console.error(e); }
  };

  const generate = async () => {
    if (!me?.id || !passed) return;
    setGen(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/pdf/certificate/${me.id}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        alert(de ? 'Zertifikat konnte nicht erstellt werden.' : 'Certificate could not be generated.');
        return;
      }
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), '_blank');
    } catch (e) { console.error('generate cert failed', e); }
    finally { setGen(false); }
  };

  if (meLoading || loading) return (
    <div className="card" style={{ padding: 20, color: C.muted, fontSize: 13 }}>…</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

      {/* STATUS BANNER */}
      <div className="card" style={{
        padding: '20px 22px',
        background: !hasGrades ? C.soft : (passed ? C.mint + '10' : C.rose + '10'),
        border: `2px solid ${!hasGrades ? C.line : (passed ? C.mint : C.rose)}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: !hasGrades ? C.muted : (passed ? C.mint : C.rose),
            display: 'grid', placeItems: 'center',
          }}>
            {!hasGrades
              ? <Award size={26} color="#fff" />
              : passed
                ? <CheckCircle2 size={26} color="#fff" />
                : <XCircle size={26} color="#fff" />}
          </div>
          <div style={{ flex: 1 }}>
            {!hasGrades ? (
              <>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.muted }}>
                  {de ? 'Noch keine Bewertungen' : 'No grades yet'}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                  {de
                    ? 'Dein Dozent hat noch keine Bewertungen eingetragen.'
                    : 'Your trainer has not entered any grades yet.'}
                </div>
              </>
            ) : passed ? (
              <>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.mint }}>
                  {de ? `Bestanden · Durchschnitt ${total}%` : `Pass · Average ${total}%`}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                  {de
                    ? 'Herzlichen Glückwunsch! Du kannst dein Zertifikat herunterladen.'
                    : 'Congratulations! You can now download your certificate.'}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.rose }}>
                  {de ? `Nicht bestanden · Durchschnitt ${total}%` : `Fail · Average ${total}%`}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                  {de
                    ? `Mindestens ${PASS_MARK}% erforderlich. Zertifikat ist gesperrt.`
                    : `Minimum ${PASS_MARK}% required. Certificate is locked.`}
                </div>
              </>
            )}
          </div>
          {hasGrades && (
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: passed ? C.mint : C.rose, lineHeight: 1 }}>
                {total}%
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                {de ? 'Gesamt' : 'Overall'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CERTIFICATE CARD */}
      <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: '0 auto 18px',
          background: passed ? C.mint + '18' : C.rose + '12',
          display: 'grid', placeItems: 'center',
        }}>
          {passed ? <Award size={38} color={C.mint} /> : <Lock size={34} color={C.rose} />}
        </div>

        <div className="disp" style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
          {certs.length > 0
            ? (de ? 'Zertifikat verfügbar' : 'Certificate available')
            : passed
              ? (de ? 'Zertifikat erstellen' : 'Generate certificate')
              : (de ? 'Zertifikat gesperrt' : 'Certificate locked')}
        </div>

        <div style={{ color: C.muted, fontSize: 13, maxWidth: 380, margin: '0 auto 22px' }}>
          {!hasGrades
            ? (de
              ? 'Zertifikat wird freigeschaltet, sobald dein Dozent Bewertungen einträgt.'
              : 'Certificate will be unlocked once your trainer enters grades.')
            : passed
              ? (de
                ? 'Du hast die Maßnahme erfolgreich abgeschlossen. Klicke unten, um dein Zertifikat zu erstellen.'
                : 'You have successfully completed the programme. Click below to generate your certificate.')
              : (de
                ? `Du hast die Maßnahme nicht bestanden (${total}%). Mindestens ${PASS_MARK}% erforderlich.`
                : `You did not pass the programme (${total}%). Minimum ${PASS_MARK}% required.`)}
        </div>

        {/* زرّ التحميل — فقط عند النجاح */}
        {passed && (
          <button
            className="btn btn-primary"
            style={{ padding: '11px 28px', fontSize: 14 }}
            disabled={gen}
            onClick={generate}
          >
            <Award size={16} />
            {gen ? '…' : (de ? 'Zertifikat herunterladen' : 'Download certificate')}
          </button>
        )}

        {/* مقفول — عند الرسوب */}
        {hasGrades && !passed && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            background: C.rose + '12', color: C.rose, fontWeight: 700, fontSize: 13,
          }}>
            <Lock size={15} />
            {de ? `Gesperrt — ${PASS_MARK}% erforderlich` : `Locked — ${PASS_MARK}% required`}
          </div>
        )}
      </div>

      {/* شهادات موجودة */}
      {certs.length > 0 && (
        <div className="card" style={{ padding: '18px 8px 8px' }}>
          <div className="card-head" style={{ padding: '0 13px 14px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={15} color={C.mint} />
              {de ? 'Ausgestellte Zertifikate' : 'Issued certificates'} · {certs.length}
            </div>
          </div>
          {certs.map((c, i) => (
            <div key={c.id ?? i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px',
              borderBottom: i < certs.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
            }}>
              <Award size={18} color={C.mint} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {c.title || (de ? 'Zertifikat' : 'Certificate')}
                </div>
                {c.createdAt && (
                  <div className="mono" style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                    {new Date(c.createdAt).toLocaleDateString('de-DE')}
                  </div>
                )}
              </div>
              <button
                className="btn btn-ghost"
                style={{ padding: '5px 11px', fontSize: 11.5 }}
                onClick={() => openDoc(c.id)}
              >
                <Download size={12} /> {de ? 'Öffnen' : 'Open'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}